import { Op } from "sequelize";
import { Banner, Product, Category } from "../models/index.model.js";
import { deleteImage, photoWork } from "../config/photoWork.js";

// ── PUBLIC: Get active banners (for homepage slider) ──
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { startDate: null, endDate: null },
          { startDate: null, endDate: { [Op.gte]: now } },
          { startDate: { [Op.lte]: now }, endDate: null },
          { startDate: { [Op.lte]: now }, endDate: { [Op.gte]: now } },
        ],
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "slug", "price", "comparePrice", "images"],
          required: false,
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
          required: false,
        },
      ],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching active banners:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ── ADMIN: Get all banners (active + inactive) ──
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "slug", "images"],
          required: false,
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
          required: false,
        },
      ],
      order: [["sortOrder", "ASC"], ["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ── ADMIN: Get single banner ──
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id, {
      include: [
        { model: Product, as: "product", required: false },
        { model: Category, as: "category", required: false },
      ],
    });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    return res.status(200).json({ success: true, data: banner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// ── ADMIN: Create banner ──
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link, linkText, productId, categoryId, sortOrder, isActive, startDate, endDate } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    // Process image via cloudinary
    const photoResult = await photoWork(req.file);

    const imageData = {
      url: photoResult.secure_url,
      public_id: photoResult.public_id,
      width: photoResult.width,
      height: photoResult.height,
      blurhash: photoResult.blurhash,
    };

    const banner = await Banner.create({
      title,
      subtitle: subtitle || null,
      image: imageData,
      link: link || null,
      linkText: linkText || "Shop Now",
      productId: productId || null,
      categoryId: categoryId || null,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// ── ADMIN: Update banner ──
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const { title, subtitle, link, linkText, productId, categoryId, sortOrder, isActive, startDate, endDate } = req.body;

    // If new image uploaded, delete old one
    if (req.file) {
      if (banner.image?.public_id) {
        await deleteImage(banner.image.public_id);
      }
      const photoResult = await photoWork(req.file);
      banner.image = {
        url: photoResult.secure_url,
        public_id: photoResult.public_id,
        width: photoResult.width,
        height: photoResult.height,
        blurhash: photoResult.blurhash,
      };
    }

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle || null;
    if (link !== undefined) banner.link = link || null;
    if (linkText !== undefined) banner.linkText = linkText || "Shop Now";
    if (productId !== undefined) banner.productId = productId || null;
    if (categoryId !== undefined) banner.categoryId = categoryId || null;
    if (sortOrder !== undefined) banner.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;
    if (startDate !== undefined) banner.startDate = startDate || null;
    if (endDate !== undefined) banner.endDate = endDate || null;

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// ── ADMIN: Delete banner ──
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    // Delete image from cloudinary
    if (banner.image?.public_id) {
      await deleteImage(banner.image.public_id);
    }

    await banner.destroy();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

// ── ADMIN: Toggle banner active status ──
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    return res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      data: banner,
    });
  } catch (error) {
    console.error("Error toggling banner:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
