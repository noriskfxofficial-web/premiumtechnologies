# طريقة رفع مشروع PT Solutions على GitHub وبعدها Netlify

## 1) فك الضغط

فك ضغط الملف، وافتح فولدر المشروع:

`PT-Solutions-GitHub-Netlify-Final`

المهم أن تكون هذه الملفات موجودة في أول مستوى داخل الريبو على GitHub:

- `package.json`
- `netlify.toml`
- `public/`
- `netlify/`
- `README.md`

لا ترفع فولدر داخله فولدر ثاني فقط، لأن Netlify يجب أن يرى `netlify.toml` و `package.json` في Root الريبو.

## 2) ارفع المشروع على GitHub

اعمل Repository جديد، ثم ارفع كل محتويات الفولدر داخله.

أفضل طريقة من الكمبيوتر:

```bash
git init
git add .
git commit -m "Initial PT Solutions website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3) اربط GitHub مع Netlify

من Netlify:

1. Add new project
2. Import an existing project
3. اختَر GitHub
4. اختَر Repository المشروع
5. تأكد من الإعدادات:
   - Build command: `npm run build`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. Deploy

## 4) أضف بيانات الأدمن الآمنة

من Netlify افتح:

Site configuration > Environment variables

وأضف:

```bash
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=YourStrongPasswordHere
ADMIN_JWT_SECRET=very-long-random-secret-key
```

بعدها اعمل Redeploy.

## 5) لوحة الأدمن

افتح:

`https://your-site-name.netlify.app/admin`

من الأدمن فيك تعدل كل محتوى الموقع وتنشر مباشرة عبر زر:

`Publish Live`

## سبب مشكلة Page Not Found السابقة

لما تعمل Drag & Drop لمشروع كامل على Netlify، Netlify لا يشغل Build، وإذا لم يجد `index.html` في أول مستوى، يظهر 404.

هذا المشروع مخصص للنشر الصحيح عبر GitHub + Netlify، لأن Netlify سيقرأ `netlify.toml` ويعرف أن الموقع داخل فولدر `public`.
