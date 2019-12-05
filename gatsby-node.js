const fetch = require("node-fetch")

exports.sourceNodes = (
  { actions, createNodeId, createContentDigest },
  configOptions
) => {
  const { createNode } = actions

  delete configOptions.plugins
  let { albumHashes } = configOptions
  let { clientId } = configOptions

  console.log(`albumHashes: ${albumHashes}`)
  let imgurUrl = `https://api.imgur.com/3/gallery/album/`
  let headers = { method: 'GET', headers: { 'Authorization': `Client-ID ${clientId}`} }

  const processNodes = album => {
    console.log("Album Info", album)
    const nodeAlbumId = createNodeId(`imgur-album-${album.id}`)
    const nodeContent = JSON.stringify(album)
    const nodeData = Object.assign({}, album, {
      id: nodeAlbumId,
      parent: null,
      internal: {
        type: `ImgurAlbum`,
        content: nodeContent,
        contentDigest: createContentDigest(album),
      },
    })
    createNode(nodeData)

    album.images.map(img => {
      createNode({
        title: img.title,
        description: img.description,
        link: img.link,
        datetime: img.datetime,
        type: img.type,
        width: img.width,
        height: img.height,
        size: img.size,
        id: createNodeId(`imgur-img-${img.id}`),
        parent: nodeAlbumId,
        internal: {
          type: `ImgurImage`,
          content: nodeContent,
          contentDigest: createContentDigest(album),
        },
      })
    });
  } //end of process nodes


  return(
    Promise.all(albumHashes.map(hash => fetch(imgurUrl + `${hash}`, headers).then(response => response.json()).then(resp => processNodes(resp.data))))
  )
}
