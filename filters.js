module.exports = {
    append: function(arr, item) {
        arr = arr || [];
        arr.push(item);
        return arr;
    },
    
    // You can add other custom filters here
    niceDate: function(date) {
        return new Date(date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    formatDate: function(date, format) {
        return moment(date).format(format);
    }
};
