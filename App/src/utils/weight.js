// Utility function to format weight based on value
const formatWeight = (weight) => {
  // Handle null, undefined, or empty values
  if (!weight && weight !== 0) {
    return '-';
  }
  
  // Convert to number if it's a string
  const numWeight = parseFloat(weight);
  
  // Handle invalid numbers
  if (isNaN(numWeight)) {
    return '-';
  }
  
  // If weight is exactly 100g, show as 1kg
  if (numWeight === 100) {
    return '1kg';
  }
  
  // If weight is under 1000g, show in grams
  if (numWeight < 1000) {
    return `${numWeight}g`;
  }
  
  // If weight is 1000g or above, show in kg with decimal
  const kg = numWeight / 1000;
  return `${kg}kg`;
};


export default formatWeight;