import { baseApi } from "@shared/api";
import type {
  CompanyDto,
  CompanyCreateDto,
  CompanyUpdateDto,
  CompanyResultDto,
  CompanyMembersResultDto,
  InviteMemberDto,
  SearchUserResultDto,
} from "./company.dto";
import type { UserResultDto } from "@entities/user";

const ENDPOINT = "company";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentCompany: builder.query<CompanyDto | null, void>({
      query: () => ({
        url: `${ENDPOINT}/current`,
        method: "GET",
      }),
      providesTags: (result) =>
        result ? [{ type: "Company", id: result.id }] : [{ type: "Company", id: "LIST" }],
    }),

    createCompany: builder.mutation<CompanyDto, CompanyCreateDto>({
      query: (data) => ({
        url: `${ENDPOINT}/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Company", id: "LIST" }],
    }),

    updateCompany: builder.mutation<CompanyDto, CompanyUpdateDto>({
      query: (data) => ({
        url: `${ENDPOINT}/update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result) =>
        result ? [{ type: "Company", id: result.id }, { type: "Company", id: "LIST" }] : [{ type: "Company", id: "LIST" }],
    }),

    getCompanyMembers: builder.query<CompanyMembersResultDto, number>({
      query: (companyId) => ({
        url: `${ENDPOINT}/${companyId}/members`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.result.map((user: { id: number }) => ({
                type: "CompanyMembers" as const,
                id: user.id,
              })),
              { type: "CompanyMembers", id: "LIST" },
            ]
          : [{ type: "CompanyMembers", id: "LIST" }],
    }),

    inviteMember: builder.mutation<
      { message: string; user: UserResultDto },
      { companyId: number; data: InviteMemberDto }
    >({
      query: ({ companyId, data }) => ({
        url: `${ENDPOINT}/${companyId}/invite`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: "CompanyMembers", id: "LIST" },
        { type: "Company", id: companyId },
      ],
    }),

    removeMember: builder.mutation<
      { message: string },
      { companyId: number; userId: number }
    >({
      query: ({ companyId, userId }) => ({
        url: `${ENDPOINT}/${companyId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { companyId }) => [
        { type: "CompanyMembers", id: "LIST" },
        { type: "Company", id: companyId },
      ],
    }),

    searchUserByEmail: builder.query<SearchUserResultDto[], string>({
      query: (email) => ({
        url: `user/search/by-email?email=${encodeURIComponent(email)}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((user: { id: number }) => ({
                type: "Users" as const,
                id: user.id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetCompanyMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
  useSearchUserByEmailQuery,
  useLazySearchUserByEmailQuery,
} = companyApi;
