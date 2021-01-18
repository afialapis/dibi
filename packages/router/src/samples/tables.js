[
  
  "table_name",


  {
    name: "table_name",
    schema: "public", // optional
    route: "custom/url",
    options: {
      
      useDibiRouterDates: true/false,

      checkBeforeDelete: [
        "another_table.field_id"
      ],
      
      customHooks: {
        beforeRead   : undefined,
        afterRead    : undefined,
        beforeInsert : undefined,
        afterInsert  : undefined,

        beforeUpdate : undefined,
        afterUpdate  : undefined,

        beforeDelete : undefined,
        afterDelete  : undefined
      },

    }
  }

]