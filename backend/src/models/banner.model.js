import { DataTypes, Model } from "sequelize";

const Banner = (sequelize) => {
  class Banner extends Model {
    static associate(models) {
      // Optional: associate with Product for "Shop Now" link
      Banner.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
        constraints: false,
      });
      Banner.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        constraints: false,
      });
    }
  }

  Banner.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Banner title is required" },
          len: { args: [2, 200], msg: "Title must be 2-200 characters" },
        },
      },
      subtitle: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      image: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: "{ url, public_id, width, height, blurhash }",
      },
      link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL to navigate to when clicked (e.g. /products/abc or /categories/phones)",
      },
      linkText: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "Shop Now",
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Optional: Link to a specific product",
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Optional: Link to a specific category",
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Banner starts showing from this date",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Banner stops showing after this date",
      },
    },
    {
      sequelize,
      tableName: "banners",
      modelName: "Banner",
      timestamps: true,
    }
  );

  return Banner;
};

export default Banner;
