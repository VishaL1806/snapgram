
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { Input } from "../ui/input"
import { PostFormValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import { useCreatePost, useUpdatePostById } from "@/lib/react-query/queriesAndMutations"
 
type PostFormProps = {
  post? : Models.Document,
  action : "Create" | "Update"
}


const PostForm = ({post,action } : PostFormProps) => {

  const {mutateAsync : createPost, isPending : isLoadingCreate} = useCreatePost();
  const {mutateAsync : updatePost, isPending : isLoadingUpdate} = useUpdatePostById();

  const {user} = useUserContext();
  const {toast} = useToast()
  const navigate = useNavigate()
      // 1. Define your form.
  const form = useForm<z.infer<typeof PostFormValidation>>({
    resolver: zodResolver(PostFormValidation),
    defaultValues: {
      caption: post?.caption??"",
      file : [],
      location :post?.location??"",
      tags : post?.tags.join(",")??""

      
    },
  })
 
  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostFormValidation>) {
    if(post && action==='Update')
    {
      const updatedPost = await updatePost({
        ...values, postId: post.$id, imageId: post.imageId,
        imageUrl: post.imageUrl
      })

      if(!updatedPost)
      {
        return toast({
          variant : "destructive",
          title: "Something went wrong , Try Again !!",
        });
      }

      return navigate(`/posts/${post.$id}`)
    }


    const newPost = await createPost({...values,userId : user.id})

    if(!newPost)
    {
      return toast({
        variant : "destructive",
        title: "Something went wrong , Try Again !!",
      });
    }

    navigate("/");
    
  }
  
  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-full">
      <FormField
        control={form.control}
        name="caption"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Caption</FormLabel>
            <FormControl>
              <Textarea className="shad-textarea custom-scrollbar"  {...field} />
            </FormControl>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Photos</FormLabel>
            <FormControl>
              <FileUploader fieldChange={field.onChange} mediaUrl={post?.imageUrl}  />
            </FormControl>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
       <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Location</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" {...field} />
            </FormControl>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" placeholder="Travel ,  Art , Introvert" {...field} />
            </FormControl>
            <FormMessage className="shad-form_message" />
          </FormItem>
        )}
      />
      <div className="flex gap-4 items-center justify-end">
      <Button type="button" className="shad-button_dark_4">Cancel</Button>
      <Button 
      type="submit" 
      className="shad-button_primary whitespace-nowrap"
      disabled={isLoadingCreate || isLoadingUpdate} >
       {isLoadingCreate || isLoadingUpdate && "Loading..."}
       {action} Post
        </Button>

      </div>
    </form>
  </Form>
  )
}

export default PostForm