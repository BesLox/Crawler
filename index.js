// Define package
const fs = require('fs')
const cheerio = require('cheerio')
const request = require('request-promise')

// Define crawl and file data json
var url_target = "http://www.dantri.com.vn"
var file_export = "./exports/data.json"

// Get page content
const getPageContent = (uri) => {
    const options = {
        uri,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        transform: (body) => {
            return cheerio.load(body)
        }
    }
    return request(options)
}

// Function get all link on page
const getLink = (html) => {
    const $ = cheerio.load(html)
    var tags = $('a')
    var links = []

    $(tags).each( (_index, link) => {
        links.push( $(link).attr('href') + (' ') + $(link).attr('title') )
    })
    
    return links
}

// Function filter link beautiful
const filterLink = (links) => {
    links.forEach((link, _index)=>{
        //Function remove item has value "xyz"
        if(link === undefined ||
            link === "./" ||
            link === "/" ||
            link === "javascript:void(0)" ||
            link.split("/")[0] == "login" ||
            link.split("/")[0] == "logout" ||
            link.split("/")[0] == "resgister"
            ){
                delete links[_index]
                return
            }
    
            // Function regex value http https www http://www https://www
            var _regex = new RegExp("https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,}")
            if(!_regex.test(link)){
                links[_index] = url_target + link
            }
            return
        })
        var links = links.filter(function (link){
            return link != null
        })
        return links
}

// Function export file data
const exportFile = (data) => {
    fs.writeFile(file_export, data, function(err){
        if(err){
            return console.log(err)
        }
        console.log(data)
        console.log("The file was saved")
    })
}

// Main function
getPageContent(url_target).then((res)=>{
    var pageHTML = res.html()
    var links = getLink(pageHTML)
    links_filted = filterLink(links)
    return exportFile(JSON.stringify(links_filted))
})