import { baseApi } from "@shared/api";
import type { SignInDto, SignInResultDto, SignUpDto, SignUpResultDto } from "./auth.dto";

const ENDPOINT = "auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<SignUpResultDto, SignUpDto>({
      query: (data) => ({
        url: `${ENDPOINT}/sign-up`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    login: builder.mutation<SignInResultDto, SignInDto>({
      query: (data) => ({
        url: `${ENDPOINT}/sign-in`,
        method: "POST",
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${ENDPOINT}/sign-out`,
        method: "POST",
      }),
    }),

    refresh: builder.mutation<SignInResultDto, void>({
      query: () => ({
        url: `${ENDPOINT}/refresh`,
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
  useRefreshMutation,
} = authApi;
