import { baseApi } from "@shared/api";
import type { DocumentDto, DocumentCreateDto, DocumentUpdateDto } from "./document.dto";

const ENDPOINT = "documents";

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentDto[], { userId: number }>({
      query: ({ userId }) => ({
        url: ENDPOINT,
        method: "GET",
        params: { userId },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Documents" as const, id })),
              { type: "Documents", id: "LIST" },
            ]
          : [{ type: "Documents", id: "LIST" }],
    }),

    getDocument: builder.query<DocumentDto, { id: number; userId: number }>({
      query: ({ id, userId }) => ({
        url: `${ENDPOINT}/${id}`,
        method: "GET",
        params: { userId },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "Documents", id }],
    }),

    createDocument: builder.mutation<
      DocumentDto,
      { data: FormData; userId: number }
    >({
      query: ({ data, userId }) => ({
        url: `${ENDPOINT}?userId=${userId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    updateDocument: builder.mutation<
      DocumentDto,
      { id: number; data: DocumentUpdateDto; userId: number }
    >({
      query: ({ id, data, userId }) => ({
        url: `${ENDPOINT}/${id}/meta?userId=${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Documents", id },
        { type: "Documents", id: "LIST" },
      ],
    }),

    deleteDocument: builder.mutation<
      void,
      { id: number; userId: number }
    >({
      query: ({ id, userId }) => ({
        url: `${ENDPOINT}/${id}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    getDownloadUrl: builder.query<
      { url: string; fileName: string; mimeType: string; size: number },
      { id: number; userId: number }
    >({
      query: ({ id, userId }) => ({
        url: `${ENDPOINT}/${id}/download-url?userId=${userId}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDownloadUrlQuery,
} = documentApi;
