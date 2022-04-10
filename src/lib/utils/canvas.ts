export async function loRes(str:string):Promise<string> {
    return new Promise((resolve, reject)=>{
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        img.src = str
        img.onload = ()=>{
            const height = img.height / img.width * 150
            canvas.width = 150
            canvas.height = height
            ctx.drawImage(img, 0 , 0, 150, height)
            resolve(canvas.toDataURL())
        }
        img.onerror = e => reject(e)
    })
}

