
import { useDeleteSavedPost, useGetCurrentUser, useLikedPost, useSavePost } from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Loader from "./Loader";

type PostStatProps = {
  post?: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatProps) => {

    const likesList = post?.likes.map((user : Models.Document)=>user.$id) 

    const [likes, setLikes] = useState(likesList)
    const [isSaved, setIsSaved] = useState(false)

    const {mutate : likePost } = useLikedPost();
    const {mutate : savePost , isPending : isSavingPost } = useSavePost();
    const {mutate : deleteSavedPost , isPending : isDeletingSaved } = useDeleteSavedPost();

    const {data : currentUser} = useGetCurrentUser();

    const savedPostRecord = currentUser?.save.find(
        (record : Models.Document) =>record.post?.$id===post?.$id)

    
    const handleLikePost = (e : React.MouseEvent)=>{
        e.stopPropagation();
        let newLikes = [...likes];

        const hasLiked = newLikes.includes(userId)
        if(hasLiked)
        {
            newLikes = newLikes.filter((id)=>id!==userId)
        }else{
            newLikes.push(userId)
        }

        setLikes(newLikes)
        likePost({postId : post?.$id , likesArray : newLikes})

    }

    const handleSavePost = (e : React.MouseEvent)=>{
        e.stopPropagation();

        if(savedPostRecord)
        {
            setIsSaved(false)
            deleteSavedPost({savedRecordId :savedPostRecord.$id})
        }else{
            setIsSaved(true)
            savePost({postId : post?.$id, userId})
        }

        
    }

    useEffect(() => {
     setIsSaved(!!savedPostRecord)
    
    }, [currentUser])


  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg": "/assets/icons/like.svg"}
          alt=""
          width={20}
          height={20}
          onClick={handleLikePost}
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>
      <div className="flex gap-2">
        {isDeletingSaved || isSavingPost?(<Loader />):(<img
          src={isSaved?"/assets/icons/saved.svg":"/assets/icons/save.svg"}
          alt=""
          width={20}
          height={20}
          onClick={handleSavePost}
        />)}
       
      </div>
    </div>
  );
};

export default PostStats;
