import {Suspense} from "react";
import {CreatePostComponent} from "@/components/create-post/create-post-component";
import { PostComposerSkeleton } from "@/components/ui/page-skeletons";

export default function CreatePostPage() {

    return (
        <Suspense fallback={<PostComposerSkeleton />}>
            <CreatePostComponent />
        </Suspense>
    )
}
