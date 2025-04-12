import { ActionTree } from "vuex";
import { ComponentState } from "@/store/modules/components/types";
import { RootState } from "@/store/types";
import AxiosClient from "@/services/api";

const baseUrl = "/components";

/**
 * Trims JSON data to extract specific fields from component items
 * while maintaining the original structure
 * @param {Object} data - The JSON data containing components
 * @returns {Object} - Trimmed JSON data with same structure
 */
function trimComponentItems(data: any) {
  // Check if data has the expected structure
  if (!data || !data.data || !data.data.components) {
    return { error: true, message: "Invalid data structure" };
  }

  // Create a copy of the data to maintain the original structure
  // const result = {
  //   error: data.error,
  //   message: data.message,
  //   data: {
  //     components: [],
  //   },
  // };
  const components: any = [];

  // Loop through each component
  data.data.components.forEach((component: any) => {
    // Create a new component object with only the required fields
    const trimmedComponent: any = {
      _id: component._id,
      status: component.status,
      name: component.name,
      description: component.description,
      items: [],
    };

    // Check if component has items array
    if (component.items && Array.isArray(component.items)) {
      // Extract the required fields from each item
      component.items.forEach((item: any) => {
        trimmedComponent.items.push({
          _id: item._id,
          id: item.id,
          component: item.component,
          name: item.name,
          json: item.json,
          html: item.html,
        });
      });
    }

    // Add the trimmed component to our result
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    components.push(trimmedComponent);
  });

  return components;
}

export const actions: ActionTree<ComponentState, RootState> = {
  getComponents({ commit }): Promise<void> {
    return AxiosClient.get(`${baseUrl}?sort=created_at&order=desc`)
      .then((res: any) => {
        const data = res.data;
        console.log(trimComponentItems(data));
        commit("SET_COMPONENTS", data.data.components);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
  getComponentItems({ commit }, componentId: string): Promise<void> {
    return AxiosClient.get(
      `${baseUrl}/${componentId}/items?sort=name&order=desc`
    )
      .then((res: any) => {
        const data = res.data;
        commit("SET_COMPONENT_ITEMS", data.data.rows);
        return res.data;
      })
      .catch((err: any): any => {
        if (err instanceof Error) {
          const message = err.message;
          return Promise.reject(new Error(message));
        }
      });
  },
};
