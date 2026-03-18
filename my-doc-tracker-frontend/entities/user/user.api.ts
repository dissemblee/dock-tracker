import { baseApi } from "@shared/api";
import type {
  UserUpdateDto,
  UserChangePasswordDto,
  UserCursorResultDto,
  UserResultDto,
} from "./user.dto";

const ENDPOINT = "user";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<
      UserCursorResultDto,
      { page?: number; perPage?: number }
    >({
      query: ({ page = 1, perPage = 10 }) => ({
        url: ENDPOINT,
        method: "GET",
        params: { page, perPage },
      }),

      providesTags: (result) => {
        const users = result?.result?.data;

        if (!users) {
          return [{ type: "Users", id: "LIST" }];
        }

        return [
          ...users.map(({ id }) => ({
            type: "Users" as const,
            id,
          })),
          { type: "Users" as const, id: "LIST" },
        ];
      },
    }),

    getUserById: builder.query<UserResultDto, number>({
      query: (id) => ({
        url: `${ENDPOINT}/${id}`,
        method: "GET",
      }),

      providesTags: (_result, _error, id) => [
        { type: "Users", id },
      ],
    }),

    updateUser: builder.mutation<
      UserResultDto,
      { id: number; data: UserUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `${ENDPOINT}/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    changePassword: builder.mutation<
      { result: { success: boolean } },
      UserChangePasswordDto
    >({
      query: (body) => ({
        url: `${ENDPOINT}/change-password`,
        method: "POST",
        body,
      }),

      invalidatesTags: [],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
} = usersApi;
