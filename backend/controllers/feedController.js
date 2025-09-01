import mongoose from "mongoose";
import Post from "../models/Post.js";

export const getPaginatedPosts = async (req, res) => {
  try {
    const userId = req.user?.id
      ? new mongoose.Types.ObjectId(req.user.id)
      : null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      // Add interaction flag
      ...(userId
        ? [
            {
              $addFields: {
                interacted: {
                  $or: [
                    { $in: [userId, "$likes"] },
                    { $in: [userId, "$comments.user"] },
                  ],
                },
              },
            },
          ]
        : [{ $addFields: { interacted: false } }]),
      {
        $sort: {
          interacted: 1, // false first
          createdAt: -1, // newest first
        },
      },
      {
        $facet: {
          posts: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                pipeline: [{ $project: { username: 1 } }],
                as: "user",
              },
            },
            { $unwind: "$user" },
            { $project: { content: 0 } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Post.aggregate(pipeline).allowDiskUse(true);

    res.json({
      posts: result[0]?.posts || [],
      currentPage: page,
      totalPages: Math.ceil((result[0]?.totalCount[0]?.count || 0) / limit),
    });
  } catch (err) {
    console.error("Pagination error:", err.message);
    res.status(500).json({ msg: "Failed to fetch posts" });
  }
};
