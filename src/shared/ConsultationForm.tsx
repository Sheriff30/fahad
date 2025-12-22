"use client";

import React from "react";
import Input from "./Input";
import Select from "./Select";
import { useContextProvider } from "@/context/Context";
import { Item, Meta, Translation } from "@/lib";
import { Controller, useForm } from "react-hook-form";
import { useAddConsultation } from "@/hooks/useConsultations";
import { usePost } from "@/hooks/usePost";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  service: string;
};

export default function ConsultationForm() {
  const { data } = usePost("services");
  const { lang, handleModelDisplay } = useContextProvider();

  const { mutate, isPending, isSuccess, isError } = useAddConsultation();

  const serviceOptions = data?.map((service: Item) => {
    const enTranslation = service.translations?.find(
      (t: Translation) => t.locale === "en"
    );
    const arTranslation = service.translations?.find(
      (t: Translation) => t.locale === "ar"
    );
    return {
      value: service.id,
      label:
        lang === "ar"
          ? arTranslation
            ? arTranslation.title
            : service.id
          : enTranslation
          ? enTranslation.title
          : service.id,
      en: enTranslation ? enTranslation.title : service.id,
      ar: arTranslation ? arTranslation.title : service.id,
    };
  });

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    const selectedService = serviceOptions?.find(
      (opt: Meta) => opt.value === data.service
    );

    const payload = {
      post_type: "consultant",
      slug: "consultant",
      is_active: 1,
      translations: [
        {
          locale: "ar",
          title: data.name,
          description: data.message,
        },
        {
          locale: "en",
          title: data.name,
          description: data.message,
        },
      ],
      post_meta: [
        {
          meta_key: "phone",

          translations: [
            {
              locale: "en",
              value: data.phone,
            },
            {
              locale: "ar",
              value: data.phone,
            },
          ],
        },
        {
          meta_key: "email",
          translations: [
            {
              locale: "en",
              value: data.email,
            },
            {
              locale: "ar",
              value: data.email,
            },
          ],
        },
        {
          meta_key: "service",
          translations: [
            {
              locale: "en",
              value: selectedService.en,
            },
            {
              locale: "ar",
              value: selectedService.ar,
            },
          ],
        },
      ],
    };

    mutate(payload);

    reset();

    setTimeout(() => {
      handleModelDisplay();
    }, 2000);
  };
  return (
    <form
      className=" p-5 lg:py-8 lg:px-12 max-w-[870px] w-full bg-white rounded-2xl flex flex-col gap-6  "
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className=" text-2xl lg:text-4xl  mb-4 text-center text-primary font-bold ">
        {lang === "ar" ? "اطلب استشارتك الآن" : "Request a Consultation Now"}
      </h2>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6  h-[400px] lg:h-auto overflow-y-scroll lg:overflow-y-auto">
        <div className="flex  flex-col gap-2">
          <label htmlFor="">{lang === "ar" ? "الاسم" : "Name"}*</label>
          <Input
            {...register("name", {
              required: lang === "ar" ? "الاسم مطلوب" : " Name is required",
              maxLength: 80,
            })}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">
              {errors.name && (
                <p className="text-red-500">{errors.name.message}</p>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="">{lang === "ar" ? "البريد" : "Email"}*</label>
          <Input
            {...register("email", {
              required: lang === "ar" ? "البريد مطلوب" : "Email is required",
              maxLength: 80,
              pattern: {
                value: /^\S+@\S+$/i,
                message: ` ${
                  lang === "ar"
                    ? " البريد الالكتروني غير صحيح "
                    : "Invalid email address"
                }`,
              },
            })}
          />

          {errors.email && (
            <span className="text-red-500 text-sm">
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>{lang === "ar" ? "رقم الهاتف" : "Phone number"}*</label>
          <Input
            {...register("phone", {
              required:
                lang === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required",
              pattern: {
                value: /^[0-9+\-() ]+$/,
                message: `${
                  lang === "ar"
                    ? " رقم الهاتف غير صحيح "
                    : "Invalid phone number"
                }`,
              },
            })}
          />

          {errors.phone && (
            <span className="text-red-500 text-sm">
              {errors.phone && (
                <p className="text-red-500">{errors.phone.message}</p>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>{lang === "ar" ? "الخدمة" : "Service"}*</label>
          <Controller
            name="service"
            control={control}
            rules={{
              required: lang === "ar" ? "خدمة مطلوبة" : "Service is required",
              maxLength: 80,
            }}
            render={({ field }) => (
              <Select
                options={serviceOptions}
                variant="secondary"
                placeholder={lang === "ar" ? "إختر الخدمة" : "Select Service"}
                {...field}
              />
            )}
          />

          {errors.service && (
            <span className="text-red-500 text-sm">
              {errors.service && (
                <p className="text-red-500">{errors.service.message}</p>
              )}
            </span>
          )}
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <label>
            {lang === "ar" ? "الرسالة (اختياري)" : "Message (optional)"}
          </label>
          <textarea
            className="border border-primary rounded-2xl h-[166px] w-full p-2"
            {...register("message", { required: false, maxLength: 80 })}
          />
        </div>
      </div>
      <div className="col-span-2 flex justify-center  flex-col gap-2 w-full items-center">
        <button
          className="bg-primary py-3 text-white max-w-[300px] w-full rounded-2xl cursor-pointer"
          type="submit"
          disabled={isPending}
        >
          {lang === "ar" ? "حدد الموعد" : " Schedule a Consultation"}
          {isPending && (lang === "ar" ? "جاري الارسال..." : "Sending...")}
        </button>

        {isSuccess && (
          <div className="text-green-500 text-lg ">
            {lang === "ar" ? "تم الارسال بنجاح" : "Sent successfully"}
          </div>
        )}

        {isError && (
          <div className="text-red-500 text-lg ">
            {lang === "ar"
              ? "حدث خطأ ما , من فضلك حاول مرة أخرى"
              : "Something went wrong please try again"}
          </div>
        )}
      </div>
    </form>
  );
}
