import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export interface Dataset {
  id: string,
  global_id: string,
  name: string,
  short_name: string,
  description?: string,
};

interface Datasets {
  total: number,
  records: Dataset[],
};

export interface Taxon {
  id: string,
  scientific_name?: string,
  scientific_name_authorship?: string,
  canonical_name?: string,
  generic_name?: string,
  specific_epithet?: string,
  intraspecific_epithet?: string,
  taxon_rank?: string,
  name_according_to?: string,
  name_published_in?: string,
  taxonomic_status?: string,
  kingdom?: string,
  phylum?: string,
  class?: string,
  order?: string,
  family?: string,
  genus?: string,
};

type TaxaParams = {
  page: number,
  pageSize: number,
  search?: string,
  datasetId?: string,
};

interface Taxa {
  total: number,
  records: Taxon[],
};

export interface TaxonAttribute {
  id: string,
  data_type: string,
  name: string,
  value: string | string[],
}


export interface UserTaxa {
  id: string,
  name: string,
  description?: string,
}

interface UserTaxaList {
  total: number,
  records: UserTaxa[],
};

export interface NameList {
  id: string,
  name: string,
  list_type: string,
  description?: string,
};

interface NameLists {
  total: number,
  records: NameList[],
};


export interface UserTaxon {
  id: string,
  taxa_lists_id: string,
  scientific_name?: string,
  scientific_name_authorship?: string,
  canonical_name?: string,
  generic_name?: string,
  specific_epithet?: string,
  intraspecific_epithet?: string,
  taxon_rank?: string,
  name_according_to?: string,
  name_published_in?: string,
  taxonomic_status?: string,
  kingdom?: string,
  phylum?: string,
  class?: string,
  order?: string,
  family?: string,
  genus?: string,
};

interface UserTaxaItems {
  total: number,
  records: UserTaxon[],
}

type UserTaxaItemsParams = {
  userTaxa: UserTaxa,
  page: number,
  pageSize: number,
};


interface LoginParams {
  email: string,
  password: string,
}

interface User {
  id: string,
  name: string,
  email: string,
}


export interface Attribute {
  id: string,
  name: string,
  data_type: string,
  description?: string,
  reference_url?: string,
}

interface AttributeList {
  total: number,
  records: Attribute[],
};

type AttributeListParams = {
  page: number,
  pageSize: number,
};


export interface TaxaImport {
  file: string,
  name: string,
  description?: string,
}

export interface ListImport {
  file: string,
  name: string,
  worker: string,
  description?: string,
}


export interface Media {
  id: string,
  url: string,
  source?: string,
  publisher?: string,
  license?: string,
  rights_holder?: string,
}

export interface MediaList {
  total: number,
  records: Media[],
}

type MediaListParams = {
  scientificName: string,
  page: number,
  pageSize: number,
};

export interface SetMainMedia {
  url: string,
  scientific_name: string,
  publisher: string,
  rights_holder: string,
  license: string,
  source: string,
}

export interface UploadMainMedia {
  file: string,
  scientific_name: string,
  publisher: string,
  rights_holder: string,
  license: string,
  source?: string,
}


const baseQuery = fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_ARGA_API_URL, credentials: "include" });

const baseQueryWithAuth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    window.location.href = "/admin/login";
  }

  return result;
}

export const adminApi = createApi({
  reducerPath: 'admin',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Datasets', 'UserTaxa', 'UserTaxon', 'Attribute', 'Media', 'NameLists'],
  endpoints: (builder) => ({

    // Auth
    login: builder.mutation<User, LoginParams>({
      query(data) {
        return {
          url: 'login',
          method: 'POST',
          body: data,
        }
      },
    }),

    //
    // Datasets
    //
    Datasets: builder.query<Datasets, void>({
      query: () => 'taxa/datasets',
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'Datasets', id } as const)),
            { type: 'Datasets', id: 'LIST' },
          ]
        } else {
          return [{ type: 'Datasets', id: 'LIST' }]
        }
      },
    }),


    //
    // Taxa
    //
    taxa: builder.query<Taxa, TaxaParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        if (params.search) paramStrings.push(`q=${params.search}`);
        if (params.datasetId) paramStrings.push(`dataset_id=${params.datasetId}`);

        return `taxa?${paramStrings.join('&')}`
      },
    }),

    taxonAttributes: builder.query<TaxonAttribute[], string>({
      query: (uuid) => `taxa/${uuid}`,
    }),


    //
    // Lists
    //
    NameList: builder.query<NameLists, void>({
      query: () => 'lists',
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'NameLists', id } as const)),
            { type: 'NameLists', id: 'LIST' },
          ]
        } else {
          return [{ type: 'NameLists', id: 'LIST' }]
        }
      },
    }),


    //
    // User Taxa Lists
    //
    userTaxaList: builder.query<UserTaxaList, void>({
      query: () => 'user_taxa',
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'UserTaxa', id } as const)),
            { type: 'UserTaxa', id: 'LIST' },
          ]
        } else {
          return [{ type: 'UserTaxa', id: 'LIST' }]
        }
      },
    }),

    createUserTaxa: builder.mutation<UserTaxa, Partial<UserTaxa>>({
      query(data) {
        return {
          url: 'user_taxa',
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'UserTaxa', id: 'LIST' }],
    }),

    getUserTaxa: builder.query<UserTaxa, string>({
      query: (id) => `user_taxa/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'UserTaxa', id }],
    }),

    updateUserTaxa: builder.mutation<UserTaxa, Partial<UserTaxa>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `user_taxa/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxa', id }],
    }),

    deleteUserTaxa: builder.mutation<UserTaxa, UserTaxa>({
      query(data) {
        return {
          url: `user_taxa/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxa', id }],
    }),

    //
    // User Taxa Items
    //
    userTaxaItems: builder.query<UserTaxaItems, UserTaxaItemsParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `user_taxa/${params.userTaxa.id}/items?${paramStrings.join('&')}`
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'UserTaxon', id } as const)),
            { type: 'UserTaxon', id: 'LIST' },
          ]
        } else {
          return [{ type: 'UserTaxon', id: 'LIST' }]
        }
      },
    }),

    createUserTaxon: builder.mutation<UserTaxon, Partial<UserTaxon>>({
      query(data) {
        return {
          url: `user_taxa/${data.taxa_lists_id}/items`,
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'UserTaxon', id: 'LIST' }],
    }),

    getUserTaxon: builder.query<UserTaxon, string>({
      query: (id) => `user_taxon/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'UserTaxon', id }],
    }),

    updateUserTaxon: builder.mutation<UserTaxon, Partial<UserTaxon>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `user_taxon/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxon', id }],
    }),

    deleteUserTaxon: builder.mutation<UserTaxon, UserTaxon>({
      query(data) {
        return {
          url: `user_taxon/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'UserTaxon', id }],
    }),


    //
    // Attributes
    //
    attributeList: builder.query<AttributeList, AttributeListParams>({
      query(params) {
        let paramStrings = [
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `attributes?${paramStrings.join('&')}`
      },
      providesTags: (result) => {
        if (result) {
          return [
            ...result.records.map(({ id }) => ({ type: 'Attribute', id } as const)),
            { type: 'Attribute', id: 'LIST' },
          ]
        } else {
          return [{ type: 'Attribute', id: 'LIST' }]
        }
      },
    }),

    createAttribute: builder.mutation<Attribute, Partial<Attribute>>({
      query(data) {
        return {
          url: 'attributes',
          method: 'POST',
          body: data,
        }
      },
      invalidatesTags: [{ type: 'Attribute', id: 'LIST' }],
    }),

    getAttribute: builder.query<Attribute, string>({
      query: (id) => `attributes/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Attribute', id }],
    }),

    updateAttribute: builder.mutation<Attribute, Partial<Attribute>>({
      query(data) {
        const { id, ...body } = data
        return {
          url: `attributes/${id}`,
          method: 'PUT',
          body,
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attribute', id }],
    }),

    deleteAttribute: builder.mutation<Attribute, Attribute>({
      query(data) {
        return {
          url: `attributes/${data.id}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attribute', id }],
    }),


    //
    // Imports
    //
    createTaxaImport: builder.mutation<null, Partial<TaxaImport>>({
      query(data) {
        return {
          url: 'queue',
          method: 'POST',
          body: data,
        }
      },
    }),
    createListImport: builder.mutation<null, Partial<ListImport>>({
      query(data) {
        return {
          url: 'queue',
          method: 'POST',
          body: data,
        }
      },
    }),


    //
    // Media
    //
    mediaList: builder.query<MediaList, MediaListParams>({
      query(params) {
        let paramStrings = [
          `scientific_name=${params.scientificName}`,
          `page=${params.page}`,
          `page_size=${params.pageSize}`,
        ];
        return `media?${paramStrings.join('&')}`
      },
      providesTags: (list) => {
        if (list) {
          return [
            ...list.records.map(({ id }) => ({ type: 'Media', id } as const)),
            { type: 'Media', id: 'LIST' },
          ]
        } else {
          return [{ type: 'Media', id: 'LIST' }]
        }
      },
    }),

    mainMedia: builder.query<Media, string>({
      query(scientificName) {
        let paramStrings = [
          `scientific_name=${scientificName}`,
        ];
        return `media/main?${paramStrings.join('&')}`
      },
      providesTags: () => [{ type: 'Media', id: 'MAIN' }],
    }),

    setMainMedia: builder.mutation<null, SetMainMedia>({
      query(body) {
        return {
          url: `media/main`,
          method: 'POST',
          body,
        }
      },
      invalidatesTags: () => [{ type: 'Media', id: 'MAIN' }],
    }),

    uploadMainMedia: builder.mutation<null, UploadMainMedia>({
      query(data) {
        return {
          url: 'media/upload_main_image',
          method: 'POST',
          body: data,
        }
      },
    }),

  }),
});

export const {
  useLoginMutation,

  useDatasetsQuery,

  useTaxaQuery,
  useTaxonAttributesQuery,

  useNameListQuery,

  useUserTaxaListQuery,
  useGetUserTaxaQuery,
  useCreateUserTaxaMutation,
  useUpdateUserTaxaMutation,
  useDeleteUserTaxaMutation,

  useUserTaxaItemsQuery,
  useGetUserTaxonQuery,
  useCreateUserTaxonMutation,
  useUpdateUserTaxonMutation,
  useDeleteUserTaxonMutation,

  useAttributeListQuery,
  useGetAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,

  useCreateTaxaImportMutation,
  useCreateListImportMutation,

  useMediaListQuery,
  useMainMediaQuery,
  useSetMainMediaMutation,
  useUploadMainMediaMutation,
} = adminApi;
