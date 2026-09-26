import { Collection, Poem } from '../types/poetry';

export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-fractures',
    title: 'Quiet Fractures & Mazes',
    description: 'Verses on guarded hearts, quiet aches, overthinking, and the weight carried on silent shoulders.',
    createdDate: '2025-12-04',
    coverMotto: 'Pretending the hinges don’t creak apart'
  },
  {
    id: 'col-sunshine',
    title: 'Sunshine in the Rain',
    description: 'Unexpected warmth, soft surrender, and the tender gravity of feeling seen by another.',
    createdDate: '2025-12-05',
    coverMotto: 'For you are the sunshine, and I am the rain'
  },
  {
    id: 'col-echoes',
    title: 'Echoes & Flotsam',
    description: 'Elegy for Kio, quiet memorials, raw thoughts, and watching the sparks fade.',
    createdDate: '2026-01-08',
    coverMotto: 'All for a glimpse of you'
  },
  {
    id: 'col-notebook',
    title: 'Unwritten Horizons',
    description: 'The poet’s compass, theme studies, creative prompts, and notebook reflections.',
    createdDate: '2026-02-10',
    coverMotto: 'Do what you want for the plot and let it flow'
  }
];

export const INITIAL_POEMS: Poem[] = [
  // --- COLLECTION 1: QUIET FRACTURES & MAZES ---
  {
    id: 'poem-doorframe',
    title: 'Doorframe & Volcano',
    subtitle: 'On holding yourself together in silence',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-03T18:00:00Z',
    tags: ['resilience', 'silence', 'hurt', 'volcano'],
    drafts: [
      {
        id: 'draft-df-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2025-12-03T18:15:00Z',
        revisionNote: 'Raw initial notebook entry; unedited phrasing.',
        stanzas: `I hold myself up like a doorframe in an old house, 
pretending the hinges don't creak apart.
Because I don't wanna feel the fall 
so I stay tall 
tho it hurts hard.`
      },
      {
        id: 'draft-df-v2',
        versionNumber: 2,
        versionTag: 'v2-revision',
        timestamp: '2025-12-03T20:30:00Z',
        revisionNote: 'Refined stanza breaks and lineation to emphasize the descent and resolve.',
        stanzas: `I hold myself up
like a doorframe in an old house,
pretending the hinges don’t creak apart.

Because I don’t want to feel the fall,
I stay tall—
even when it hurts hard.`
      },
      {
        id: 'draft-df-v3',
        versionNumber: 3,
        versionTag: 'v3-final',
        timestamp: '2025-12-04T11:00:00Z',
        revisionNote: 'Integrated the silence and the dead volcano subterranean imagery.',
        stanzas: `I hold myself up
like a doorframe in an old house,
pretending the hinges don’t creak apart.

Because I don’t want to feel the fall,
I stay tall—
even when it hurts hard.

I scream no more, ’cause it won’t change a thing
For my silence holds the sway,
and I don’t have the strength to pray.

It sleeps within me like a dead volcano,
silent on the surface,
but molten deep inside.
Unexpecting the day it wakes.`
      }
    ]
  },
  {
    id: 'poem-flower-in-vain',
    title: 'The Flower in Vain',
    subtitle: '4-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-04T14:00:00Z',
    tags: ['light', 'longing', 'autumn', 'unseen'],
    drafts: [
      {
        id: 'draft-fiv-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2025-12-04T14:15:00Z',
        revisionNote: 'First draft composed on the unreachable bloom.',
        stanzas: `A tiny flower, a little too away,
yet at bay.
Hoping to touch the light,
but failing again
and again.
And maybe it isn’t meant to be—
forever something never meant to be seen.`
      },
      {
        id: 'draft-fiv-v2',
        versionNumber: 2,
        versionTag: 'v2-final',
        timestamp: '2025-12-04T17:45:00Z',
        revisionNote: 'Added the autumn withering couplet for closure.',
        stanzas: `A tiny flower a little too away
yet at bay.
Hoping to touch light
but failing again and
again.

And maybe it isn't meant to be
Forever not meant to be seen.

Unnoticed, it withers away
by the end of fall.`
      }
    ]
  },
  {
    id: 'poem-tainted-eyes',
    title: 'Tainted Eyes',
    subtitle: '04/05-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-04T22:30:00Z',
    tags: ['perception', 'flaws', 'beauty', 'fade'],
    drafts: [
      {
        id: 'draft-te-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-05T01:10:00Z',
        revisionNote: 'Dec 4-5 manuscript: exploring self-image, unmeasured steps, and tainted sight.',
        stanzas: `If beauty were to lie in the eyes of the beholder,
then maybe mine are tainted.
For they see the light I seem to hide away,
and the hues I fail to recognize.

I count steps not meant to be measured,
foreseeing a future not meant to be lived.
Yet hoping it would all eventually
FADE
or maybe not.

Beauty lies beneath the cover,
but how can I see through
when I can’t even cross-over
my flaws
with my tainted eyes?

And maybe that's just me.`
      }
    ]
  },
  {
    id: 'poem-quiet-ache',
    title: 'The Quiet Ache',
    subtitle: '05-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-05T10:00:00Z',
    tags: ['longing', 'detachment', 'price', 'walking-away'],
    drafts: [
      {
        id: 'draft-qa-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-05T10:20:00Z',
        revisionNote: 'Dec 5 manuscript: on outgrowing desperation and choosing to walk away.',
        stanzas: `I don’t wait for things
I once ached for so desperately.
Maybe it isn't worth,
or maybe it is.
I can never decide.

And now that I get a glimpse of it,
I dread the price—
For I have to pay
wishing it would stay.
Losing myself on the way,
so now I choose to walk away.`
      }
    ]
  },
  {
    id: 'poem-lost-cause',
    title: 'Lost Cause',
    subtitle: '05-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-05T14:00:00Z',
    tags: ['tunnel', 'light', 'pain', 'reach'],
    drafts: [
      {
        id: 'draft-lc-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-05T14:15:00Z',
        revisionNote: 'Dec 5 manuscript: chasing mirages of light at the end of the tunnel.',
        stanzas: `A ray of light at the end of the tunnel,
far out of reach,
yet something I wish to preach.
A little too far,
maybe near,
and suddenly nothing at all.
Hopelessly we run in vain,
for an end that tends to pain.`
      }
    ]
  },
  {
    id: 'poem-loops-within',
    title: 'Loops Within',
    subtitle: '06-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-06T16:00:00Z',
    tags: ['mind', 'maze', 'loops', 'soul'],
    drafts: [
      {
        id: 'draft-lw-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-06T16:30:00Z',
        revisionNote: 'Dec 6 manuscript: mental cycles and letting the soul drift to start over.',
        stanzas: `My mind is in a haze,
probably lost within a maze.
Trying to chase
things I can’t trace.
In loops over and
over again,
not letting me explain.
I let my soul drift over,
letting me start over.`
      }
    ]
  },
  {
    id: 'poem-sedated',
    title: 'Sedated~',
    subtitle: '26-12-2025',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2025-12-26T18:00:00Z',
    tags: ['numb', 'peace', 'fear', 'transformation'],
    drafts: [
      {
        id: 'draft-sed-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-26T18:25:00Z',
        revisionNote: 'Dec 26 manuscript: fear of feeling good and not knowing who you are.',
        stanzas: `I feel out of the blue,
like someone new.
Maybe it isn’t me,
or the better ME!
I never know.

For now I am sedated,
without the rush
that might/could crush
ME.

It feels good,
and that’s what scares me—
not knowing if this is me.`
      }
    ]
  },
  {
    id: 'poem-i-fear',
    title: 'I Fear',
    subtitle: '08-01-2026',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2026-01-08T11:00:00Z',
    tags: ['origin', 'heritage', 'escape', 'change'],
    drafts: [
      {
        id: 'draft-if-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-08T11:20:00Z',
        revisionNote: 'Jan 8 manuscript: the dread of becoming what you come from.',
        stanzas: `I fear 
becoming what I come from.
Eventually 
being what I am made of.

And yet I run endlessly,
hoping it would all change magically/miraculously.`
      }
    ]
  },
  {
    id: 'poem-idk',
    title: 'idk',
    subtitle: 'On unspoken burdens',
    collectionId: 'col-fractures',
    author: 'Author',
    dateCreated: '2026-01-15T15:00:00Z',
    tags: ['weight', 'expression', 'shoulder', 'quiet'],
    drafts: [
      {
        id: 'draft-idk-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-15T15:10:00Z',
        revisionNote: 'Short fragment: carrying unexpressed weight.',
        stanzas: `Too much for some,
and nothing at all to another.
For I don’t know how to express
the weight I carry
on my shoulder.`
      }
    ]
  },

  // --- COLLECTION 2: SUNSHINE IN THE RAIN ---
  {
    id: 'poem-sunshine-rain',
    title: 'The Shift of the Weather',
    subtitle: 'Sunshine to the Rain — To the boy who came in randomly',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2025-12-15T20:00:00Z',
    tags: ['sunshine', 'rain', 'seen', 'walls', 'maze'],
    drafts: [
      {
        id: 'draft-sr-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2025-12-15T20:30:00Z',
        revisionNote: 'Initial lyrical flow: unexpected arrival and contrasting choices.',
        stanzas: `To the boy who came in randomly, 
I believe it all happened eventually. 
 
Either way, I can’t explain 
the shift that stirred the change.

Making me feel seen with ease, 
like I was touched by a tender breeze. 
Maybe not something I wanted, 
but deep down needed. 

Our choices differ, and so do we— 
for you are the sunshine, 
and I am the rain.`
      },
      {
        id: 'draft-sr-v2',
        versionNumber: 2,
        versionTag: 'v2-final',
        timestamp: '2025-12-18T22:15:00Z',
        revisionNote: 'Complete revision: added sky imagery, the lowering of the wall, and the author note.',
        stanzas: `To the boy who came in randomly, 
I believe it all happened eventually. 
 
Either way, I can’t explain 
the shift that stirred the change.

Making me feel seen with ease, 
like I was touched by a tender breeze. 
Maybe not something I wanted, 
but deep down needed. 

Our choices differ, and so do we— 
for you are the sunshine, 
and I am the rain.

Where the air is cold,
and the light is mellow,
glazing over the sky in shades of yellow.
Birds jumping in, jumping out,
jumping off the sky—
just to touch,
and feel alive.

And you reached, lowering my wall,
catching a piece, saving time from its fall.
Here I stand, lost in a daze,
unable to trace
the route of our maze.

And when I do retrace,
I would, with all grace,
stand by—
but even if I were to tell,
I’d look you in the eye and spell.

---
Author Note:
This poem came from a moment in my life when someone unexpected made me feel seen in ways I didn’t know I needed. I wrote it to capture the strange softness of meeting a person who feels like warmth against your rain — and the quiet fear and beauty that comes with it.`
      }
    ]
  },
  {
    id: 'poem-warm-embrace',
    title: 'The Warm Embrace',
    subtitle: '09-02-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-02-09T21:00:00Z',
    tags: ['heartbeat', 'embrace', 'flame', 'gale', 'sanctum'],
    drafts: [
      {
        id: 'draft-we-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2026-02-09T21:20:00Z',
        revisionNote: 'First version: the racing heart and the flame in a gale.',
        stanzas: `The day I felt his heart race
under my trace,
unable to control its pace—

was also the day
I fell deep
(and deeper)
into his embrace.

As he pressed
against my temple,
and held me as if
I were the last flame
standing in a gale,

Making me feel
like a little child,
longing to be held,
again and again.`
      },
      {
        id: 'draft-we-v2',
        versionNumber: 2,
        versionTag: 'v2-final',
        timestamp: '2026-02-10T11:40:00Z',
        revisionNote: 'Refined cadence; concluding with the ecstatic sanctuary kiss.',
        stanzas: `The day I felt his heart race
under my trace,
unable to control its pace—

was also the day
I fell deep,
(and deeper,)
into his embrace.

Like a little child,
longing to be held,
again and again.

And when he kissed me,
I felt like I was dreaming.
ecstatic.
under 
sanctum`
      }
    ]
  },
  {
    id: 'poem-hope-of-it-all',
    title: 'With the Hope of It All',
    subtitle: 'Aligning across the night sky',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-02-14T23:00:00Z',
    tags: ['love', 'stars', 'iris', 'sparks', 'eternity'],
    drafts: [
      {
        id: 'draft-hoa-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2026-02-14T23:15:00Z',
        revisionNote: 'First draft: the sparks in his eyes.',
        stanzas: `I may not know
when it turned to love—
or maybe I do.

For it all
aligned
at once.

And yet the sparks in his eyes
had spoken all along,
twinkling like stars
across the night sky.
With the hope of all
to stay ever~`
      },
      {
        id: 'draft-hoa-v2',
        versionNumber: 2,
        versionTag: 'v2-final',
        timestamp: '2026-02-16T18:00:00Z',
        revisionNote: 'Deepened conclusion: etched in the iris and watching the years roll by.',
        stanzas: `I may not know
when it turned to love—
or maybe I do.

For it all
aligned
at once.

And yet the sparks in his eyes
had spoken all along,
twinkling like stars
across the night sky.

Glistening in his iris,
Etching me into his soul.
Wishing on the note
that it stays—
ever.
hoping to watch the years
roll by with you.`
      }
    ]
  },
  {
    id: 'poem-love-you-more',
    title: 'Love You More~',
    subtitle: 'Every time I spell I love you',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-02-20T22:00:00Z',
    tags: ['devotion', 'stars', 'heavens', 'everything'],
    drafts: [
      {
        id: 'draft-lym-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-02-20T22:30:00Z',
        revisionNote: 'Original complete dedication.',
        stanzas: `Every time I spell
I love you,
I love you more.
How much more—
I never know.

More enough
to fight battles beside you,
bring the stars down,
and overturn the sea.

More enough
to burn the heavens,
turn the earth,
if it meant you'd remain
untouched.

Because
my heart aches,
yearning
for you.

And
it tears me apart
to see you in pain.

For I would
let go of everything.

For you are
my everything.

And I would do it all,
if I had to—
for you.`
      }
    ]
  },
  {
    id: 'poem-till-i-perish',
    title: 'Till I Perish',
    subtitle: '12-05-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-05-12T19:00:00Z',
    tags: ['cherish', 'perish', 'devotion', 'ever'],
    drafts: [
      {
        id: 'draft-tip-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-05-12T19:15:00Z',
        revisionNote: 'May 12 manuscript: holding him dearly as a matter of fact.',
        stanzas: `I held him
dearly,
and knew instantly,
as a matter
of fact,
that I had to—
ever.

For the love of it all,
ever and ever,
that I would cherish
until I perish.`
      }
    ]
  },
  {
    id: 'poem-breathe',
    title: 'Breathe',
    subtitle: '13-05-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-05-13T08:30:00Z',
    tags: ['breath', 'shoulder', 'intimacy', 'morning'],
    drafts: [
      {
        id: 'draft-br-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-05-13T08:45:00Z',
        revisionNote: 'May 13 manuscript: breath upon a shoulder.',
        stanzas: `He felt my breath
on his shoulder.

What an irony—
he liked it.

And if it were to end,
it would be a mess.
Because the day begins with him,
and ends in mine—
breathe.`
      }
    ]
  },
  {
    id: 'poem-illusion',
    title: 'Illusion',
    subtitle: '01-06-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-06-01T17:00:00Z',
    tags: ['autumn', 'leaves', 'belief', 'walk-by'],
    drafts: [
      {
        id: 'draft-il-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-06-01T17:15:00Z',
        revisionNote: 'June 1 manuscript: dried leaves stomped beneath footsteps.',
        stanzas: `Love is an illusion,
or so I believed.
Till he walked by,
stomping it over
like dried leaves
fallen in autumn.

Maybe it isn't an
ILLUSION
after all.`
      }
    ]
  },
  {
    id: 'poem-pretty-boy',
    title: 'Pretty Boy',
    subtitle: 'From the oblivion of its existence',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-06-10T20:00:00Z',
    tags: ['survival', 'oblivion', 'chant', 'devotion'],
    drafts: [
      {
        id: 'draft-pb-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-06-10T20:20:00Z',
        revisionNote: 'Short incantation: what have you made of me?',
        stanzas: `From the oblivion of its existence
to the necessity for my survival.
I would chant it
over and over again.
Gladly.
Oh, pretty boy—
what have you made of me?`
      }
    ]
  },
  {
    id: 'poem-i-wonder',
    title: 'I Wonder',
    subtitle: 'Looking lost in his eyes',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-06-15T21:00:00Z',
    tags: ['spell', 'scent', 'arms', 'heartbeat'],
    drafts: [
      {
        id: 'draft-iw-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-06-15T21:20:00Z',
        revisionNote: 'His heart beneath my ear.',
        stanzas: `I wonder,

Looking lost in his eyes,
Bound under his spell.
Enclosed in his scent,
Wrapped in his arms.
His heart beneath my ear.

Looking up,

I think they call this
love.

And I would stay there—

forever.`
      }
    ]
  },
  {
    id: 'poem-appealing-invitation',
    title: 'Appealing Invitation',
    subtitle: '09-01-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-01-09T18:00:00Z',
    tags: ['survival', 'life', 'cherish', 'his-face'],
    drafts: [
      {
        id: 'draft-ai-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-09T18:15:00Z',
        revisionNote: 'Jan 9 manuscript: wanting to survive each day just to see his face.',
        stanzas: `Even if death were to invite me
tomorrow,
I’d leave gladly.

For I exist
because I couldn’t perish—
nor do I live,
or truly cherish.

But now it feels different.

Now I want to survive each day
over again,
just to see his face
one last time.`
      }
    ]
  },
  {
    id: 'poem-fleeting-time',
    title: 'Fleeting Time',
    subtitle: '09-01-2026',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-01-09T22:00:00Z',
    tags: ['time', 'seconds', 'months', 'stopping-time'],
    drafts: [
      {
        id: 'draft-ft-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-09T22:15:00Z',
        revisionNote: 'Jan 9 manuscript: hours collapsing into seconds.',
        stanzas: `Time skips when 
I am with you,
hours collapsing into seconds,
but making months
feel like years.

And if I could do one thing,
it would be to stop
time—
with you.`
      }
    ]
  },
  {
    id: 'poem-eleven-eleven',
    title: '11:11',
    subtitle: 'Making one plus one equal eleven',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2026-01-11T11:11:00Z',
    tags: ['wish', 'numbers', 'connection', 'hope'],
    drafts: [
      {
        id: 'draft-ee-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-11T11:11:00Z',
        revisionNote: 'The 11:11 wish.',
        stanzas: `I know
one plus one
gives two,
but I hope us to be
one of the few—

And make
one plus one
equal eleven
at every
eleven, oh eleven.`
      }
    ]
  },
  {
    id: 'poem-timezone',
    title: 'Timezone',
    subtitle: '05-12-2025 — Dedicated to Pooja',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2025-12-05T16:00:00Z',
    tags: ['crowd', 'isolation', 'connection', 'pooja'],
    drafts: [
      {
        id: 'draft-tz-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-05T16:20:00Z',
        revisionNote: 'Dec 5 manuscript: zoning out of the row to find someone new.',
        stanzas: `People everywhere around,
not a person to be found
through the crowd.

So I zone out of the row,
trying to find someone new
to not feel blue.`
      }
    ]
  },
  {
    id: 'poem-lipbalm',
    title: 'Lipbalm',
    subtitle: 'A fragment of me',
    collectionId: 'col-sunshine',
    author: 'Author',
    dateCreated: '2025-12-20T12:00:00Z',
    tags: ['keepsake', 'note', 'safe', 'memory'],
    drafts: [
      {
        id: 'draft-lb-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-20T12:15:00Z',
        revisionNote: 'A keepsake fragment fostering safety and care.',
        stanzas: `A fragment of me,
I foster you to keep—
alive and gracious,
safe and sound,
in you, with a little note.`
      }
    ]
  },

  // --- COLLECTION 3: ECHOES & FLOTSAM ---
  {
    id: 'poem-glimpse-of-you',
    title: 'A Glimpse of You',
    subtitle: 'To the Cat of My Life~ Kio',
    collectionId: 'col-echoes',
    author: 'Author',
    dateCreated: '2026-01-08T09:00:00Z',
    tags: ['kio', 'cat', 'grief', 'love', 'longing'],
    drafts: [
      {
        id: 'draft-goy-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-08T09:30:00Z',
        revisionNote: 'Heartfelt elegy for Kio: aching for a moment that will never come.',
        stanzas: `I'm sorry.
I was stupid.
I couldn't do anything.

You showed me what love was,
and made me wanna come back
to you,
anywhere I was.
And every time I close my eyes,
I see you—
all small and sweet,
my little baby.

How could you decide to leave me
all alone
without warning.
Hanging still.
I look around everywhere,
Knowing I won't find you anywhere.
Wondering who I'd come back to? 

And still, I look.
Believing, somehow,
I'll catch a glimpse of you.

Longing for you,
aching for a moment
that will never come.

All for a glimpse of you.

Kio.`
      }
    ]
  },
  {
    id: 'poem-kio-devotion',
    title: 'KIO',
    subtitle: 'Giving beyond my hold',
    collectionId: 'col-echoes',
    author: 'Author',
    dateCreated: '2026-01-10T14:00:00Z',
    tags: ['kio', 'love', 'unconditional', 'peace'],
    drafts: [
      {
        id: 'draft-kd-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-10T14:20:00Z',
        revisionNote: 'Cherishing peace without resentment.',
        stanzas: `Giving beyond my hold,
Without a flicker of resentment.
Willing to shoot and reach out of zone
Js to make it ease and cherish the peace 
For him
And ig thats what u call love~
Ik its smtg out of reach irl,
but i really wish to preach if i can.`
      }
    ]
  },
  {
    id: 'poem-queen-of-the-night',
    title: 'The Queen of the Night',
    subtitle: 'Withered by the day',
    collectionId: 'col-echoes',
    author: 'Author',
    dateCreated: '2026-01-12T07:00:00Z',
    tags: ['bloom', 'night', 'ephemeral', 'spectacle'],
    drafts: [
      {
        id: 'draft-qon-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-01-12T07:15:00Z',
        revisionNote: 'Observation on nocturnal beauty yielding to dawn.',
        stanzas: `The Queen of the Night
withered by the day.
What a spectacle to witness.`
      }
    ]
  },
  {
    id: 'poem-dumb-shyt',
    title: 'Dumb Shyt',
    subtitle: 'Was it worth the pain?',
    collectionId: 'col-echoes',
    author: 'Author',
    dateCreated: '2025-12-18T19:00:00Z',
    tags: ['glory', 'sin', 'pain', 'walk-over'],
    drafts: [
      {
        id: 'draft-ds-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2025-12-18T19:15:00Z',
        revisionNote: 'Attaining the weight of glory.',
        stanzas: `Was it worth the pain?

Really—
If I were to say
Maybe.

Gladly walk over again
just to attain
the weigh of glory.

Its the sin I cant control,
but would badly uphold.`
      }
    ]
  },
  {
    id: 'poem-observers',
    title: 'Observers',
    subtitle: 'REEL — Sparks fade',
    collectionId: 'col-echoes',
    author: 'Author',
    dateCreated: '2026-01-14T20:00:00Z',
    tags: ['sparks', 'observers', 'crowd', 'beginning-end'],
    drafts: [
      {
        id: 'draft-obs-v1',
        versionNumber: 1,
        versionTag: 'v1-init',
        timestamp: '2026-01-14T20:15:00Z',
        revisionNote: 'Raw sketch: watching the sparks fade.',
        stanzas: `the sparks eventually fades,
but i hope 
yours doesnt

At the end and begining we all are js watchers/observers`
      },
      {
        id: 'draft-obs-v2',
        versionNumber: 2,
        versionTag: 'v2-final',
        timestamp: '2026-01-14T21:00:00Z',
        revisionNote: 'Polished balance of observers and zoning out of the row.',
        stanzas: `the sparks eventually fade,
but I hope 
yours doesn’t.

At the beginning and the end,
we are all just observers.

I zone out of the row,
trying to find someone new.`
      }
    ]
  },

  // --- COLLECTION 4: UNWRITTEN HORIZONS ---
  {
    id: 'poem-notebook-prompts',
    title: 'The Unwritten Horizons',
    subtitle: 'Themes & Prompts for the Plot',
    collectionId: 'col-notebook',
    author: 'Author',
    dateCreated: '2026-02-15T12:00:00Z',
    tags: ['prompts', 'themes', 'healing', 'growth', 'resilience'],
    drafts: [
      {
        id: 'draft-np-v1',
        versionNumber: 1,
        versionTag: 'v1-final',
        timestamp: '2026-02-15T12:30:00Z',
        revisionNote: 'The poet’s manifesto, theme catalogue, and upcoming arcs.',
        stanzas: `idk who needs to hear this, but if ur someone like me who always wanted to do some shyt but lacks consistency and fears what others might think:
Well I got ya twn. People are gonna judge you anyways, so do what you want for the plot and let it flow. 

So this is me trying to post some shyt. okieee bieee.

---

✨ NEW THEMES YOU HAVEN’T WRITTEN YET ✨

1. “I outgrew what I once wanted.” — DONE
   (a poem about realizing you’ve changed without noticing.)
2. “Learning to trust myself again.”
   (rebuilding self-belief after doubting everything.)
3. “Quiet anger.”
   (not explosive… just still, simmering, controlled.)
4. “The version of me that never happened.”
   (an alternate self you sometimes meet in your mind.)
5. “Unsent messages.”
   (things you’ll never say to the people who shaped you.)
6. “I’m soft but I’ve survived storms.”
   (gentle strength, not loud, not dramatic.)
7. “Healing is boring.”
   (the emptiness between falling apart and becoming better.)
8. “The fear of being truly seen.”
   (wanting connection but hiding parts of yourself.)
9. “I am not hard to love, I’m just deeply guarded.”
   (soft romantic but with emotional logic behind it.)
10. “What if I’m meant for more, but too scared to rise?”
   (ambition vs fear, that internal tug-of-war.)

---

✨ REFLECTION SEEDS ✨

1. “I am gentle, just not with myself.” (soft pain, self-neglect, tender but bruised.)
2. “I collect moments I never speak about.” (nostalgia, secrets, quiet memories.)
3. “I am learning to forgive the person I used to be.” (healing arc, subtle strength.)
4. “Some days I feel borrowed, not alive.” (existential, detached, floaty vibe.)
5. “I apologize for taking up space.” (insecurity, shrinking, reclaiming self-worth later.)
6. “I hold myself together in ways no one sees.” (private strength, quiet resilience.)
7. “I didn’t grow cold, I just stopped burning.” (burnout, emotional exhaustion.)
8. “I keep breaking in the same place.” (recurring hurt, patterns, old wounds.)
9. “I want peace, but my mind wants noise.” (inner conflict, restless thoughts.)
10. “I outgrow people too quietly.” (soft detachment, change, distance.)`
      }
    ]
  }
];
