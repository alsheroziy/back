
function checkCategoryForRestricted(categories) {
    for (const category of categories) {
        if (category.isRestricted) return true
    }
    return false
}

module.exports = checkCategoryForRestricted