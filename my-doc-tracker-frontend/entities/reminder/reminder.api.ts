import { baseApi } from "@shared/api";
import type { ReminderDto, ReminderCreateDto, ReminderUpdateDto } from "./reminder.dto";

const ENDPOINT = "reminders";

export const reminderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReminders: builder.query<ReminderDto[], { userId: number }>({
      query: ({ userId }) => ({
        url: ENDPOINT,
        method: "GET",
        params: { userId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Reminders" as const, id })),
              { type: "Reminders", id: "LIST" },
            ]
          : [{ type: "Reminders", id: "LIST" }],
    }),

    getReminder: builder.query<ReminderDto, { id: number; userId: number }>({
      query: ({ id, userId }) => ({
        url: `${ENDPOINT}/${id}`,
        method: "GET",
        params: { userId },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "Reminders", id }],
    }),

    createReminder: builder.mutation<
      ReminderDto,
      { data: ReminderCreateDto; userId: number }
    >({
      query: ({ data, userId }) => ({
        url: `${ENDPOINT}?userId=${userId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Reminders", id: "LIST" }],
    }),

    updateReminder: builder.mutation<
      ReminderDto,
      { id: number; data: ReminderUpdateDto; userId: number }
    >({
      query: ({ id, data, userId }) => ({
        url: `${ENDPOINT}/${id}?userId=${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Reminders", id },
        { type: "Reminders", id: "LIST" },
      ],
    }),

    deleteReminder: builder.mutation<
      void,
      { id: number; userId: number }
    >({
      query: ({ id, userId }) => ({
        url: `${ENDPOINT}/${id}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reminders", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRemindersQuery,
  useGetReminderQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = reminderApi;
