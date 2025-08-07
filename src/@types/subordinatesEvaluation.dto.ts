export interface SubordinatesEvaluation {
  "@odata.etag": string;
  systemId: string;
  documentNo: string;
  lineNo: number;
  attributeCode: string;
  keyEnablingAttribute: string;
  rating: number;
  comment: string;
  anySuggestion: string;
}

export interface SubordinatesEvaluationFormData {
  documentNo?: string;
  lineNo?: number;
  attributeCode: string;
  keyEnablingAttribute: string;
  rating: number;
  comment: string;
  anySuggestion: string;
  systemId?: string;
}
