import { baseApi } from "@shared/api";
import type {
  DocumentDto,
  DocumentCreateDto,
  DocumentUpdateDto,
  DocumentQueryDto,
  DocumentImageUrlDto,
} from "./document.dto";

const ENDPOINT = "documents";

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentDto[], DocumentQueryDto>({
      query: (params) => ({
        url: ENDPOINT,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Documents" as const, id })),
              { type: "Documents", id: "LIST" },
            ]
          : [{ type: "Documents", id: "LIST" }],
    }),

    getDocument: builder.query<DocumentDto, number>({
      query: (id) => ({
        url: `${ENDPOINT}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, documentId) => [{ type: "Documents", id: documentId }],
    }),

    createDocument: builder.mutation<
      DocumentDto,
      { data: FormData }
    >({
      query: ({ data }) => ({
        url: ENDPOINT,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    updateDocument: builder.mutation<
      DocumentDto,
      { id: number; data: DocumentUpdateDto }
    >({
      query: ({ id, data }) => ({
        url: `${ENDPOINT}/${id}/meta`,
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
      { id: number }
    >({
      query: ({ id }) => ({
        url: `${ENDPOINT}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    getDownloadUrl: builder.query<
      { url: string; fileName: string; mimeType: string; size: number },
      number
    >({
      query: (id) => ({
        url: `${ENDPOINT}/${id}/download-url`,
        method: "GET",
      }),
    }),

    getImageUrl: builder.query<
      DocumentImageUrlDto,
      number
    >({
      query: (id) => ({
        url: `${ENDPOINT}/${id}/image-url`,
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
  useGetImageUrlQuery,
} = documentApi;
