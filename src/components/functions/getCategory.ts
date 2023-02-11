import { doc, getDoc } from '@firebase/firestore'
import { OptionCategory } from 'src/components/models'
import { auth, db } from 'src/firebase'

export const getCategory = async () => {
    const docRef = doc(db, auth.currentUser!.uid, 'option')
    const docData = (await getDoc(docRef)).data()
    const category = docData?.category as OptionCategory[]

    return category
}