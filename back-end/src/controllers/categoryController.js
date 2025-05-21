import prisma from "../config/db.js";
import { validationResult } from "express-validator";

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving categories",
      error: error.message,
    });
  }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }, // Use UUID directly
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving category",
      error: error.message,
    });
  }
};

/**
 * @desc    Get songs by category
 * @route   GET /api/categories/:id/songs
 * @access  Public
 */
export const getSongsByCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const categoryId = req.params.id; // Use UUID directly

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const songs = await prisma.song.findMany({
      where: { categoryId },
      skip,
      take: limit,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSongs = await prisma.song.count({
      where: { categoryId },
    });

    res.status(200).json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        totalSongs,
        totalPages: Math.ceil(totalSongs / limit),
      },
    });
  } catch (error) {
    console.error("Error getting songs by category:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving songs by category",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;

    // Check if category with same name already exists
    const categoryExists = await prisma.category.findFirst({
      where: { name },
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: req.params.id }, // Use UUID directly
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if name is already taken by another category
    if (name && name !== categoryExists.name) {
      const nameExists = await prisma.category.findFirst({
        where: {
          name,
          id: { not: req.params.id }, // Use UUID directly
        },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: req.params.id }, // Use UUID directly
      data: {
        name,
        description,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: req.params.id }, // Use UUID directly
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if there are songs in this category
    const songCount = await prisma.song.count({
      where: { categoryId: req.params.id }, // Use UUID directly
    });

    if (songCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category that contains songs. Remove or reassign songs first.",
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id }, // Use UUID directly
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
