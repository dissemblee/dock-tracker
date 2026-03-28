import { baseApi } from "@shared/api";
import type { SignInDto, SignInResultDto, SignUpDto, SignUpResultDto } from "./auth.dto";

const ENDPOINT = "auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<SignUpResultDto, SignUpDto>({
      query: (data) => ({
        url: `${ENDPOINT}/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    login: builder.mutation<SignInResultDto, SignInDto>({
      query: (data) => ({
        url: `${ENDPOINT}/login`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${ENDPOINT}/logout`,
        method: "POST",
      }),
    }),

  }),
  overrideExisting: false,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
