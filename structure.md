# #### **UI:**

#### composant Tweet:composant Tweet:

**Tweet**

> TweetHeader
>
> > Username
> > Avatar
> >
> > > PP (profile picture)
> > > FollowButton

> TweetContent
>
> > Hashtag
> > TweetText
> > TweetImage

> TweetFooter
>
> > LikeButton
> > RepublicationButton
> > CommentButton

---

##### variants "mignature" pour l'affichage dans le feed

#### composant Register:

Sa structure peut rester la même

---

#### composant Profile:

**Profile**

> Banner
>
> > modifyButton
> >
> > > Button

> Username
>
> > modifyButton
> >
> > > Button

> PP
>
> > modifyButton
> >
> > > Button

> Post
> (idem à la version mignature des tweets)
>
> > deleteButton
> >
> > > Button

> links (website)
> links (localisation)

#### composant Settings:

**Settings**
(structure inconnu pour le moment)

##### composant Post

**Post**

> PostComposer
> PostCounter
> Button

# ROUTE

> Feed
> Explore
> Post (creating a post)
> Layout/root
> Header
>
> > Logo
> > profile
> > setting
> > logout
> > refresh

> NavigationBar
> Footer
