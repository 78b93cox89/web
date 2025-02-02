// typing/artwork.d.ts

export interface BaseResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

export interface Picture {
  id: string;
  width: number;
  height: number;
  file_name: string;
  thumbnail: string;
  regular: string;
}

export interface Artwork {
  id: string;
  title: string;
  source_url: string;
  artist: {
    name: string;
  };
  pictures: Picture[];
}

export interface ArtworkListResponse extends BaseResponse<Artwork[]> { }

export interface CountResponse extends BaseResponse<number> { }

export interface Artist {
  id: string;
  name: string;
  username: string;
  type: string;
  uid: number;
}

export interface ArtistResponse extends BaseResponse<Artist> { }

export interface ArtworkDetailData {
  id: string;
  title: string;
  source_url: string;
  like_count: number;
  description: string;
  tags: string[];
  artist: {
    id: string;
    name: string;
    username: string;
  };
  source_type: string;
  pictures: Picture[];
}

export interface ArtworkDetailResponse extends BaseResponse<ArtworkDetailData> { }

export interface Tag {
  name: string;
}

export interface TagListResponse extends BaseResponse<Tag[]> { }

export interface ArtworkListRequest {
  page: number;
  page_size: number;
  artist_id?: string;
}

export interface LikeStatusResponse extends BaseResponse<boolean> { }
