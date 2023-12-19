# Cloud Firestore Rules

```javascript
rules_version = '2';

service cloud.firestore {
    match /databases/{database}/documents {
        match /diagrams/{diagram} {
            allow create: if (request.resource.data.keys().hasAll(['id', 'visibility'])) &&
            (request.resource.data.keys().hasOnly(
                ['id', 'visibility', 'relations', 'shapes']));
            allow list: if false;
            
            function ownerOrPublic() {
                return resource.data.visibility == 'public' || resource.data.author_id == request.auth.uid;
            }
            allow write: if request.auth != null && ownerOrPublic();
        
            allow get, read: if resource.data.visibility == 'public';
        }
    }
}
```