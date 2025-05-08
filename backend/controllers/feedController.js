import axios from "axios";

export const fetchFeed = async (req, res) => {
  try {
    const reddit = await axios.get("https://www.reddit.com/r/popular.json");

    const redditPosts = reddit.data.data.children.map((item) => {
      const post = item.data;
      let image = null;

      if (post.preview?.images?.[0]?.source?.url) {
        image = post.preview.images[0].source.url.replace(/&amp;/g, "&");
      } else if (post.thumbnail && post.thumbnail.startsWith("http")) {
        image = post.thumbnail;
      }

      return {
        source: "Reddit",
        title: post.title,
        link: `https://reddit.com${post.permalink}`,
        image,
      };
    });

    res.json(redditPosts);
  } catch (error) {
    console.error("Feed fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
};
