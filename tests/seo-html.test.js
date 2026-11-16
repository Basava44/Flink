import test from 'node:test';
import assert from 'node:assert/strict';

import { injectSeo, homeSeo, profileSeo, pageSeo, notFoundSeo } from '../src/seo/html.js';

const TEMPLATE = `<html><head><!--seo:head--><title>old</title><!--/seo:head--><script src="/app.js"></script></head>
<body><div id="root"><!--seo:body--><p>old</p><!--/seo:body--></div></body></html>`;

test('injectSeo replaces only the marked head and body blocks', () => {
  const html = injectSeo(TEMPLATE, { head: '<title>new</title>', body: '<p>new</p>' });
  assert.match(html, /<!--seo:head-->\s*<title>new<\/title>\s*<!--\/seo:head-->/);
  assert.match(html, /<!--seo:body--><p>new<\/p><!--\/seo:body-->/);
  assert.match(html, /<script src="\/app.js"><\/script>/);
  assert.doesNotMatch(html, /old/);
});

test('homepage includes FAQPage schema and crawlable FAQ text', () => {
  const { head, body } = homeSeo();
  assert.match(head, /<link rel="canonical" href="https:\/\/myflink.in\/"/);
  assert.match(head, /"@type":"FAQPage"/);
  assert.match(head, /"@type":"Organization"/);
  assert.match(body, /<h1>/);
  assert.match(body, /What is Flink\?/);
});

const profile = {
  handle: 'basava44',
  bio: 'Designer & <maker>',
  location: 'Bengaluru',
  website: 'basava.dev',
  profile_url: 'https://x.supabase.co/avatar.png',
};
const links = [
  { platform: 'instagram', url: 'instagram.com/basava44' },
  { platform: 'email', url: 'me@example.com' },
  { platform: 'phone', url: '+919876543210' },
  { platform: 'custom', url: 'https://shop.example.com', label: 'My shop' },
  { platform: 'custom', url: 'someone@gmail.com', label: 'Mail me' },
];

test('profile has self canonical, escaped bio and Person schema', () => {
  const { head, body } = profileSeo({ profile, name: 'Basava', links });
  assert.match(head, /<title>Basava \(@basava44\) - Flink<\/title>/);
  assert.match(head, /<link rel="canonical" href="https:\/\/myflink.in\/basava44"/);
  assert.match(head, /<meta property="og:type" content="profile"/);
  assert.match(head, /Designer &amp; &lt;maker&gt;/);
  assert.match(head, /"@type":"ProfilePage"/);
  assert.match(head, /"sameAs":\["https:\/\/instagram.com\/basava44","https:\/\/shop.example.com","https:\/\/basava.dev"\]/);
  assert.match(body, /<h1>Basava<\/h1>/);
  assert.match(body, /href="https:\/\/instagram.com\/basava44"/);
});

test('profile never exposes email or phone in server HTML', () => {
  const { head, body } = profileSeo({ profile, name: 'Basava', links });
  assert.doesNotMatch(head + body, /me@example.com|9876543210|gmail/);
});

test('JSON-LD cannot break out of its script tag', () => {
  const { head } = profileSeo({ profile: { ...profile, bio: '</script><script>alert(1)</script>' }, name: 'x', links: [] });
  assert.doesNotMatch(head.split('application/ld+json')[1], /<\/script><script>/);
});

test('app pages are noindex and not-found pages are noindex', () => {
  assert.match(pageSeo({ title: 'Log in', path: '/login', noindex: true }).head, /noindex/);
  assert.match(notFoundSeo('nobody').head, /noindex/);
  assert.doesNotMatch(pageSeo({ title: 'Privacy Policy', path: '/privacy' }).head, /noindex/);
});
