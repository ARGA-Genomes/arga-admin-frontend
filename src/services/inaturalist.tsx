import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


export interface Media {
  id: number,
  license_code: string,
  url: string,
  attribution: string,
  source: string,
}

export interface Observation {
  photos: Media[],
  uri: string,
}

export interface MediaList {
  total_results: number,
  page: number,
  per_page: number,
  results: Observation[],
}

type MediaListParams = {
  scientificName: string,
  page: number,
  pageSize: number,
};


const baseQuery = fetchBaseQuery({ baseUrl: "https://api.inaturalist.org/v1/" });

export const iNaturalistApi = createApi({
  reducerPath: '',
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    //
    // Photos
    //
    photoList: builder.query<MediaList, MediaListParams>({
      query(params) {
        let paramStrings = [
          'photos=true',
          'photo_licensed=true',
          'lrank=species',
          'quality_grade=research',
          'order=desc',
          'order_by=votes',
          `taxon_name=${params.scientificName}`,
          `page=${params.page}`,
          `per_page=${params.pageSize}`,
        ];
        return `observations?${paramStrings.join('&')}`
      },
    }),
  }),
});

export const {
  usePhotoListQuery,
} = iNaturalistApi;
