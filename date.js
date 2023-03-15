
module.exports = function(){

    const d = new Date();
    
    const options = {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    
    return d.toLocaleDateString("Indian", options);

}