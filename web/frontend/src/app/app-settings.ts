import tags from '../assets/data/tags.json';

export class AppSettings {
  //ElasticSearch Settings
  public static ES_INDEX = 'lodestone';
  public static ES_PAGE_SIZE = 10;

  public static SORT_BY_OPTIONS = {
    "relevance": "Relevance",
    "title": "Name",
    "size": "Size",
    "new": "Newest"
  };

  public static TIME_RANGE_OPTIONS = {
    "today": "Today",
    "yesterday": "Yesterday",
    "week": "This Week",
    "month": "This Month",
    "year": "This Year",
    "all": "All Time"
  };

  public static TAGS = tags
}
