import { ProjectStyle } from "@/store/modules/canvas/types";

export interface PreviewState {
  navigatedFromCanvas: boolean;
  currentPreview: string | null; //TODO: Add types, mobile, desktop
  project: object | null;
  components: any[];
  style: ProjectStyle;
}
