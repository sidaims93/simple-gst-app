"use strict";
const db = require("../models");
const UnitModel = db.Unit;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    var data = [
      {
        label: "BAGS",
        value: "bags",
      },
      {
        label: "BOTTLES",
        value: "bottles",
      },
      {
        label: "BOX",
        value: "box",
      },
      {
        label: "Bundles",
        value: "bundles",
      },
      {
        label: "Cans",
        value: "cans",
      },
      {
        label: "Cartons",
        value: "cartons",
      },
    ];

    for await (const row of data) {
      let existingRecord = await UnitModel.findOne({
        where: { label: row.label },
      });
      if (existingRecord) {
        await UnitModel.update(
          { value: row.value },
          { where: { label: row.label } },
        );
      } else {
        await UnitModel.create(row);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
