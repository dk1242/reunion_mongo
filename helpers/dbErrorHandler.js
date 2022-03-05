"use strict";

/**
 * Get unique error field name
 */
const uniqueMessage = (error) => {
  let output;
  try {
    console.log("A", error.message);
    let fieldName = error.message.substring(
      error.message.lastIndexOf("x:"),
      error.message.lastIndexOf("_1")
    );
    console.log(fieldName.slice(3));
    output =
      fieldName.charAt(3).toUpperCase() +
      fieldName.slice(4) +
      " already exists. " +
      "Please use another " +
      fieldName.charAt(3).toUpperCase() +
      fieldName.slice(4);
  } catch (ex) {
    output = "Unique field already exists";
  }

  return output;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = (error) => {
  let message = "";
  // console.log("@@@@", error);
  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = "Something went wrong";
    }
  } else {
    for (const p in error.errors) {
      message = error.errors[p].properties.message;
      break;
      // console.log("a", p, typeof p, error.errors[p].properties.message);
    }
  }
  // console.log("msg", message);
  return message;
};
