export type {
  DocumentDto,
  DocumentCreateDto,
  DocumentUpdateDto,
} from "./document.dto";
export {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDownloadUrlQuery,
  documentApi,
} from "./document.api";
