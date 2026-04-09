import { baseApi } from "@shared/api";
import { tokenStore } from "@shared/api/tokenStore";
import type {
  DocumentDto,
  DocumentCreateDto,
  DocumentUpdateDto,
  DocumentQueryDto,
  DocumentImageUrlDto,
  DocumentGroupedByOwner,
} from "./document.dto";

const ENDPOINT = "documents";
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_URL || "http://localhost:3000")
  : "http://localhost:3000";

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

    /** Иерархический список документов компании (сгруппированный по сотрудникам) */
    getDocumentsGroupedByOwner: builder.query<
      DocumentGroupedByOwner[],
      { companyId: number; query?: Omit<DocumentQueryDto, "companyId"> }
    >({
      query: ({ companyId, query: q }) => ({
        url: `${ENDPOINT}/company/${companyId}/grouped`,
        method: "GET",
        params: q,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.flatMap((group) =>
                group.documents.map((doc) => ({ type: "Documents" as const, id: doc.id }))
              ),
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

    getImageBlob: builder.query<
      Blob,
      number
    >({
      queryFn: async (id) => {
        try {
          const token = tokenStore.get();

          const response = await fetch(`${API_BASE_URL}/documents/${id}/image`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();

          // Проверяем что это действительно Blob
          if (!(blob instanceof Blob) || blob.size === 0) {
            throw new Error('Invalid blob response');
          }

          return { data: blob };
        } catch (error) {
          return { error: error as any };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDocumentsQuery,
  useGetDocumentsGroupedByOwnerQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDownloadUrlQuery,
  useGetImageUrlQuery,
  useGetImageBlobQuery,
} = documentApi;
