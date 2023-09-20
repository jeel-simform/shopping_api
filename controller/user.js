const sequelize = require("sequelize");
const models = require("../models/index");

const createUser = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const user = await models.User.create({
      name,
      email,
      address,
    });
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};
const createOrder = async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const order = await models.Order.create({
      status,
      deliveryDate,
    });
    res.status(200).json({
      order,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
const createProduct = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const product = await models.Product.create({
      title,
      price,
      description,
    });
    res.status(200).json({
      product,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

const userInfo = async (req, res) => {
  try {
    const user = await models.User.findAll({
      attributes: [["name", "customer name"]],
      include: {
        model: models.Order,
        where: {
          status: "undelivered",
        },
        attributes: ["deliverydate"],

        include: {
          model: models.Product,
          attributes: ["title"],
        },
      },
    });
    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
const unDelivery = async (req, res) => {
  try {
    const order = await models.Order.findAll({
      where: {
        status: "undelivered",
      },
    });
    res.status(200).json({
      order,
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
const mostRecentOrder = async (req, res) => {
  try {
    const order = await models.Order.findAll({
      attributes: ["id", "status", "deliverydate", "userId"],
      order: [["createdAt", "desc"]],
      limit: 5,
      include: models.User,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
};
const mostActiveUser = async (req, res) => {
  try {
    const order = await models.Order.findAll({
      group: ["userId", "User.id"],
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("userId")), "no_of_orders"],
        "userId",
      ],
      include: models.User,
      order: [["no_of_orders", "desc"]],
      limit: 5,
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(404).send(err);
  }
};

const mostInActive = async (req, res) => {
  try {
    const user = await models.User.findAll({
      attributes: ["name", "email"],
      include: {
        model: models.Order,
        attributes: [],
      },
      where: {
        "$Orders.userId$": null,
      },
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send(err);
  }
};
const mostPurchased = async (req, res) => {
  try {
    const product = await models.Orderdetail.findAll({
      group: ["productId", "Product.id"],
      attributes: [
        "productId",
        [
          sequelize.fn("COUNT", sequelize.col("productId")),
          "no_of_time_purchased",
        ],
      ],
      include: {
        model: models.Product,
        attributes: ["title", "price"],
      },
      order: [["no_of_time_purchased", "desc"]],
      limit: 5,
    });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).send(err);
  }

  res.send(product);
};
const mostExpense = async (req, res) => {
  try {
    const orderDetails = await models.Orderdetail.findOne({
      group: "orderId",
      attributes: [
        "orderId",
        [sequelize.fn("sum", sequelize.col("Product.price")), "total_amount"],
      ],
      include: {
        model: models.Product,
        attributes: [],
      },
      order: [["total_amount", "desc"]],
    });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).send(err);
  }
};

const cheapest = async (req, res) => {
  const orderDetails = await models.Orderdetail.findOne({
    group: "orderId",
    attributes: [
      "orderId",
      [sequelize.fn("sum", sequelize.col("Product.price")), "total_amount"],
    ],
    include: {
      model: models.Product,
      attributes: [],
    },
    order: [["total_amount", "asc"]],
  });
  res.send(orderDetails);
};
module.exports = {
  unDelivery,
  mostRecentOrder,
  cheapest,
  mostExpense,
  mostPurchased,
  mostActiveUser,
  mostInActive,
  createUser,
  createOrder,
  createProduct,
  userInfo,
};
