# Brevo email drafts

Copy for the first emails to send from Brevo. Everything below uses facts already on the website. Check names, dates and links before sending. Brevo's menu names change from time to time, so treat the click paths as a guide.

## 1. Welcome email (automatic, to the `Newsletter` list)

**What it does:** sends one friendly email to each new person who joins the `Newsletter` list, whether they signed up on the website, at a session through the QR poster, or by ticking the box on a form.

**Set up in Brevo:** Automations, create a workflow, choose a trigger such as "Contact added to a list", pick `Newsletter`, add a "Send an email" step with the content below, then activate. Send a test to yourself first. Use `info@liftflintshire.co.uk` (verified) as the sender, or `hello@liftflintshire.co.uk` once it is verified.

**Subject:** You're on the list

**Preview text:** News, session updates and events from Lift Flintshire.

**Body:**

> Hi {{ contact.FIRSTNAME | default: "there" }},
>
> Thanks for joining the Lift Flintshire newsletter. We're a community interest company running strength, fitness and wellbeing sessions across Flintshire, and every programme starts free.
>
> Here's what you'll hear from us:
>
> - News and updates from Flintshire Run Club and Flintshire Weightlifting Club
> - Changes to sessions, so you never turn up to the wrong place
> - Events, such as our free coached track running for women and girls
>
> New to us? You don't need any experience. Take a look at what's on:
>
> - Run Club: https://liftflintshire.co.uk/run-club
> - Weightlifting Club: https://liftflintshire.co.uk/weightlifting-club
> - Wellbeing programmes: https://liftflintshire.co.uk/wellbeing
> - Events: https://liftflintshire.co.uk/events
>
> We only email people who ask us to, and you can unsubscribe at any time using the link at the bottom of any email.
>
> See you soon,
> The Lift Flintshire team

**Footer:** Brevo adds the unsubscribe link and your postal address. Make sure the sender address in Brevo's account settings is correct (UK law requires it in marketing emails).

## 2. First campaign: women and girls track event (21 November)

**Who to send it to:** the Brevo list `Event: Nov_WTR` (people who entered this event and ticked the email box). To reach everyone who has opted in to Women's Run Club news, use `Programme: womens-run-club` instead. To reach everyone, use `Newsletter`. These lists appear automatically after the first opted-in sign-up or entry.

**Set up in Brevo:** Campaigns, Email, Create an email campaign, choose the list, paste the content below, send a test, then schedule or send.

**Subject:** Free track running for women and girls, Saturday 21 November

**Preview text:** Coached, friendly, all abilities. Places are limited.

**Body:**

> Hi {{ contact.FIRSTNAME | default: "there" }},
>
> Our free coached track running session for women and girls is on **Saturday 21 November at 10:00, Deeside Athletics Track**.
>
> It's for any ability, from complete beginners to regular runners. No one gets left behind.
>
> **Enter here (free):** https://liftflintshire.co.uk/events/Nov_WTR
>
> Places are limited to 50, so please enter soon. If you can't make it after entering, let us know so we can offer your place to someone else.
>
> See you on the track,
> The Lift Flintshire team

**Check before sending:** the event page still shows places available, and the date and time match the Events sheet.

## 3. Rules to keep

- Only send to lists made of people who opted in. Never upload the `Registrations` sheet to Brevo. Those people agreed to registration, not to marketing email.
- A short operational note about a session someone has already booked (for example a venue change) is different from a newsletter, but if in doubt use an opted-in list.
- Every campaign needs the unsubscribe link, which Brevo adds automatically. Do not remove it.
- Do not email under-18s. For Youth Weightlifting only the parent or guardian opts in, and they join the `Guardians: youth-weightlifting` list.
