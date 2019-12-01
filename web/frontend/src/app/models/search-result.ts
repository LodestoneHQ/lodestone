export class SearchResult {
  _index: string;
  _id: string;
  _source: {
    content: string;
    lodestone:{
      tags: string[];
      bookmark: boolean;
    }
    meta: {
      author: string;
      date: string;
      keywords: string[];
      title: string;
      language: string;
      format: string;
      identifier: string;
      contributor: string;
      publisher: string;
      source: string;
      description: string;
      comments: string;
    }
    file: {
      content_type: string;
      extension: string;
      filename: string;
      filesize: number;

      created: string;
      last_modified: string;
      indexed_date: string;
    }
    storage: {
      bucket: string;
      path: string;
      thumb_bucket: string;
      thumb_path: string;
    }
  }
  highlight: {
    content: string[]
  }
}
