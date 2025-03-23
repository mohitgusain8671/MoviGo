import { Client, ID, Databases, Query } from "appwrite"

const Project_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID 
const Collection_Id = import.meta.env.VITE_APPWRITE_DB_COLLECTION_ID

console.log(Project_ID)
console.log(DB_ID)
console.log(Collection_Id)
const client = new Client()
client.setEndpoint('https://cloud.appwrite.io/v1')
.setProject(Project_ID)

const db = new Databases(client)
export const updateSearchCount = async (searchTerm, movie) => {
    // 1. Use Appwrite SDK to check if search term exist in Db 
    try{
        const result = await db.listDocuments(
            DB_ID,
            Collection_Id,
            [Query.equal('searchTerm',searchTerm)]
        )
         // 2. If it does update the count
        if (result.documents.length > 0){
            const doc = result.documents[0];
            await db.updateDocument(DB_ID, Collection_Id, doc.$id, {
            Count: doc.Count + 1
            })
        } else {
            // 3. if it doesn't create new documnet with the search term and count as 1
            await db.createDocument(DB_ID,Collection_Id,ID.unique(), {
                searchTerm: searchTerm,
                Count: 1,
                Movie_Id: movie.id,
                Poster_Url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            })

        }
    }catch(err){
        console.error(err)
    }
}

export const getTrendingMovies = async () => {
    try{
        const result = await db.listDocuments(DB_ID,Collection_Id, [
            Query.limit(5),
            Query.orderDesc('Count')
        ]);
        return result.documents;
    }catch(err){
        console.error(err)
    }
}