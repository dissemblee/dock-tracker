import { baseApi } from "@shared/api";
import type {
  UserUpdateDto,
  UserChangePasswordDto,
  UserCursorResultDto,
  UserResultDto,
  UserDto,
  UpdateWorkModeDto,
} from "./user.dto";

const ENDPOINT = "user";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserDto, void>({
      query: () => ({
        url: `${ENDPOINT}/current`,
        method: "GET",
      }),
      providesTags: (result) =>
        result ? [{ type: "Users", id: result.id }] : [{ type: "Users", id: "LIST" }],
    }),

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
        const users = result?.data;

        if (!users) {
          return [{ type: "Users", id: "LIST" }];
        }

        return [
          ...users.map((user: { id: number }) => ({
            type: "Users" as const,
            id: user.id,
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

    /** Переключить режим работы (personal / company) */
    updateWorkMode: builder.mutation<UserDto, UpdateWorkModeDto>({
      query: (data) => ({
        url: `${ENDPOINT}/work-mode`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Documents", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentUserQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useUpdateWorkModeMutation,
} = usersApi;
