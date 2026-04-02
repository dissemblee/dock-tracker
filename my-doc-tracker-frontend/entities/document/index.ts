export type {
  DocumentDto,
  DocumentCreateDto,
  DocumentUpdateDto,
  DocumentQueryDto,
  DocumentImageUrlDto,
} from "./document.dto";
export {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDownloadUrlQuery,
  useGetImageUrlQuery,
  documentApi,
} from "./document.api";
