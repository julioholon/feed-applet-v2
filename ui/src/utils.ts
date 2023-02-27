import { Assessment } from "@neighbourhoods/sensemaker-lite-types";
import { encodeHashToBase64 } from '@holochain/client'
import { Post, WrappedEntry, WrappedPostWithAssessment } from "./types";

function addMyAssessmentsToPosts(myPubKey: string, posts: WrappedEntry<Post>[], assessments: Record<string, Array<Assessment>>): WrappedPostWithAssessment[] {
    const postsWithMyAssessments = posts.map(post => {
      const assessmentsForTask = assessments[encodeHashToBase64(post.entry_hash)]
      let myAssessment
      if (assessmentsForTask) {
        myAssessment = assessmentsForTask.find(assessment => encodeHashToBase64(assessment.author) === myPubKey)
      }
      else {
        myAssessment = undefined
      }
      return {
        ...post,
        assessments: myAssessment,
      }
    })
    return postsWithMyAssessments
  }

  export { addMyAssessmentsToPosts }
