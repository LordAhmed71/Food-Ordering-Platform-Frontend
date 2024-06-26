import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/hooks";
import { getMyRestaurantInfo, getRestaurantStatus } from "@/store";
import { MangeRestaurantValidator, TMangeRestaurantValidator } from "@/types";
import { updateMyRestaurant, createMyRestaurant } from "@/services";

import {
  Form,
  Separator,
  DetailsSection,
  CuisinesSection,
  MenuSection,
  ImageSection,
  Button,
  LoadingButton,
} from "@/components";

const MangeRestaurant = () => {
  const { loading } = useAppSelector(getRestaurantStatus);
  const restaurant = useAppSelector(getMyRestaurantInfo);
  const dispatch = useAppDispatch();
  const isEditing = !!restaurant;

  const form = useForm<TMangeRestaurantValidator>({
    resolver: zodResolver(MangeRestaurantValidator),
    defaultValues: {
      cuisines: [],
      menuItems: [{ name: "", price: 0 }],
    },
    disabled: loading,
  });

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    const deliveryPriceFormatted = parseInt(
      (restaurant.deliveryPrice / 100).toFixed(2)
    );

    const menuItemsFormatted = restaurant.menuItems.map((item) => ({
      ...item,
      price: parseInt((item.price / 100).toFixed(2)),
    }));

    const updatedRestaurant = {
      ...restaurant,
      deliveryPrice: deliveryPriceFormatted,
      menuItems: menuItemsFormatted,
    };

    form.reset(updatedRestaurant);
  }, [form, restaurant]);

  const onSubmit = (formDataJson: TMangeRestaurantValidator) => {
    const formData = new FormData();

    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);

    formData.append(
      "deliveryPrice",
      (formDataJson.deliveryPrice * 100).toString()
    );
    formData.append(
      "estimatedDeliveryTime",
      formDataJson.estimatedDeliveryTime.toString()
    );
    formDataJson.cuisines.forEach((cuisine, index) => {
      formData.append(`cuisines[${index}]`, cuisine);
    });
    formDataJson.menuItems.forEach((menuItem, index) => {
      formData.append(`menuItems[${index}][name]`, menuItem.name);
      formData.append(
        `menuItems[${index}][price]`,
        (menuItem.price * 100).toString()
      );
    });

    if (formDataJson.imageFile) {
      formData.append(`imageFile`, formDataJson.imageFile);
    }
    dispatch(
      isEditing ? updateMyRestaurant(formData) : createMyRestaurant(formData)
    )
      .unwrap()
      .then(({ message }) => {
        toast.success(message);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 bg-gray-50 p-5 sm:p-10 rounded-lg"
      >
        <DetailsSection />
        <Separator />
        <CuisinesSection />
        <Separator />
        <MenuSection />
        <Separator />
        <ImageSection />
        {loading ? (
          <LoadingButton title="submitting" />
        ) : (
          <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
        )}
      </form>
    </Form>
  );
};

export default MangeRestaurant;
