import { canvas } from "@/composables/canvas/canvas";

export function project() {
  const { removeClasses } = canvas();

  const createProjectComponentObj = (
    projectComponentId: string,
    projectId: string,
    componentItem: any,
    json: any[],
    html: string
  ) => {
    return {
      _id: projectComponentId,
      id: projectComponentId,
      project: projectId,
      componentItem: componentItem.id,
      componentItemName: componentItem.name,
      json,
      html,
      defaultJson: componentItem.json,
      defaultHtml: componentItem.html,
      version: componentItem.version,
      componentItemHistory: componentItem.componentItemHistory,
    };
  };

  const duplicateProjectComponentObj = (
    newProjectComponentId: string,
    projectId: string,
    projectComponentCleaned: any
  ) => {
    return {
      _id: newProjectComponentId,
      id: newProjectComponentId,
      project: projectId,
      componentItem: projectComponentCleaned.componentItem,
      json: removeClasses(projectComponentCleaned.json),
      html: projectComponentCleaned.html,
      componentItemName: projectComponentCleaned.componentItemName,
      defaultHtml: projectComponentCleaned.defaultHtml,
      defaultJson: projectComponentCleaned.defaultJson,
      version: projectComponentCleaned.version,
      componentItemHistory: projectComponentCleaned.componentItemHistory,
    };
  };

  const formatProjectComponents = (projectComponents: any[]) => {
    return projectComponents.map((projectComponent) => {
      return {
        _id: projectComponent.id,
        id: projectComponent.id,
        project: projectComponent.project,
        componentItem: projectComponent.componentItem.id,
        componentItemName: projectComponent.componentItem.name,
        json: projectComponent.json,
        html: projectComponent.html,
        defaultJson: projectComponent.json,
        defaultHtml: projectComponent.html,
        version: projectComponent.version,
        componentItemHistory: projectComponent.componentItemHistory,
      };
    });
  };

  return {
    createProjectComponentObj,
    duplicateProjectComponentObj,
    formatProjectComponents,
  };
}
