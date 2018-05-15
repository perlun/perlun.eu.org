---
layout: post
title:  "Puma and JRuby with SSL"
categories:
- jruby
- operations
- programming
---

Trying to get Puma working on JRuby with SSL/TLS (i.e. https) suport has
turned out to be a bit challenging; this is honestly a blog post I would
rather not have had to write. Why are things so complex sometimes?

Speaking about Puma support for JRuby; it _is_ supported, but the
documentation is sparse and there seems to be [some
issues](https://github.com/puma/puma/issues/1125) with the implementation.

Here's what I did, after realizing "I cannot get this working" (that's when
I started writing down the various steps I was trying now, both for myself
and for others.)

- I downloaded the sample keystore from
  https://github.com/puma/puma/blob/429d17bca11f8d22dcc1434c9f6ac826a06fa836/examples/puma/keystore.jks,
  password blahblah. It worked fine.
- `keytool` gave a warning about this certificate:

```shell
Warning:
The JKS keystore uses a proprietary format. It is recommended to migrate to PKCS12 which is an industry standard
format using "keytool -importkeystore -srckeystore /Users/plundberg/Downloads/keystore.jks -destkeystore
/Users/plundberg/Downloads/keystore.jks -deststoretype pkcs12".
```

- I converted it to PKCS12 format:

```shell
keytool
    -importkeystore \
    -srckeystore /Users/plundberg/Downloads/keystore.jks \
    -destkeystore ~/.ssl/keystore \
    -deststoretype pkcs12
```

  It still worked fine.
- Keystore looked like this:

```shell
$ keytool -list -v -keystore ~/.ssl/keystore
Enter keystore password:
Keystore type: PKCS12
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: mydomain
Creation date: 23 Apr 2018
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown
Issuer: CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown
Serial number: 5036f86c
Valid from: Fri Aug 24 06:43:40 EEST 2012 until: Thu Nov 22 05:43:40 EET 2012
Certificate fingerprints:
	 SHA1: C5:B9:97:3A:4A:18:48:2D:D5:46:DC:56:29:6A:C2:C1:A2:21:01:F6
	 SHA256: 7F:63:9E:BA:DC:C4:20:A7:82:75:F2:56:5A:FE:EA:27:BA:56:8C:96:D6:B9:AB:E1:5A:C9:39:1E:18:FF:07:93
Signature algorithm name: SHA1withRSA
Subject Public Key Algorithm: 2048-bit RSA key
Version: 3


*******************************************
*******************************************
```

- I then imported my own cert:

```shell
$ keytool \
    -noprompt \
    -importcert \
    -keystore ~/.ssl/keystore \
    -file ~/.ssl/localhost/certificate.crt \
    -alias mydomain
```

- Did not work; curl output an error when making a request.
- Imported CA certificate also:

```shell
$ keytool \
    -noprompt \
    -importcert \
    -keystore ~/.ssl/keystore \
    -file ~/.ssl/ca.crt \
    -alias root
```

- It still failed in the same way.
- I then tried "the nginx approach", by concatenating the cert with root
  cert before import:

```shell
$ cat ~/.ssl/localhost/certificate.crt ~/.ssl/ca.crt  > foo.crt
```

- Re-imported certificate: `keytool -noprompt -importcert -keystore ~/.ssl/keystore -file foo.crt -alias mydomain`

It still failed in a similar manner. Here is the error I got with curl:

```shell
$ curl https://localhost:8443 -v -k
* Rebuilt URL to: https://localhost:8443/
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/cert.pem
  CApath: none
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to localhost:8443
* stopped the pause stream!
* Closing connection 0
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to localhost:8443
```

...and in the access log for the web server I got _absolutely nothing_. No
access log entry, no exception, no nothing.

> If you are a software developer reading this, this is for you: This is
> absolutely _the worst_, when things break with _no clear error message_
> about what is happening. A big, fat error saying "you have messed things
> up because of foo bar baz" is much, much more helpful than the dreaded
> silence. It's not clear to me at this stage where the missing error
> handling is (in Puma or the Java JRE);  I looked briefly at Puma's
> [MiniSSL
> class](https://github.com/puma/puma/blob/master/ext/puma_http11/org/jruby/puma/MiniSSL.java)
> and the exception handling there seems basically sane.

But wait: when writing the above, I realized that _I am actually squelching
Puma's STDOUT and STDERR channels_. What if... it _does_ print an error but
it's going to `/dev/null`? I immediately disabled this squelching for now,
to be able to better debug the error.

Unfortunately, this did not help at all. Sure, I got more output messages
being printed, but absolutely _nada_ about my SSL failure.

```shell
$ bundle exec uxfactory
INFO  [2018-04-24 09:46:51.815] UxFactoryServer: Listening at https://localhost:8443.
INFO  [2018-04-24 09:46:51.822] UxFactoryServer: Listening at http://localhost:8000.
INFO  [2018-04-24 09:46:51.825] UxFactoryServer: Local config.ru detected, overriding server built-in Rack configuration.
Puma starting in single mode...
* Version 3.11.3 (jruby 9.1.17.0 - ruby 2.3.3), codename: Love Song
* Min threads: 0, max threads: 16
* Environment: development
INFO  [2018-04-24 09:46:51.896] UxFactoryServer: Version 8.19.0 (8caaa0cf) started (powered by Puma 3.11.3 and jruby 9.1.17.0)
* Listening on tcp://0.0.0.0:8000
* Listening on ssl://0.0.0.0:8443?cert=&key=&keystore=/Users/plundberg/.ssl/keystore&keystore-pass=blahblah&verify_mode=none
Use Ctrl-C to stop
```

## An idea: missing the SSL key

While being away from the computer (sometimes the best way to solve the
problem!), I realized a detail: I hadn't actually imported the _key_ for
the certificate into the keystore. How could it possibly work without it?
:laughing:

I would look further into this, but let's first try with a self-signed
certificate (should absolutely work):

```shell
$ keytool -genkeypair -keystore ~/.ssl/keystore -keyalg RSA -validity 3650
Enter keystore password:
Re-enter new password:
What is your first and last name?
  [Unknown]:  localhost
What is the name of your organizational unit?
  [Unknown]:
What is the name of your organization?
  [Unknown]:
What is the name of your City or Locality?
  [Unknown]:
What is the name of your State or Province?
  [Unknown]:
What is the two-letter country code for this unit?
  [Unknown]:
Is CN=localhost, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown correct?
  [no]:  y
```

This worked much better, except that it was self-signed and hence gave
certificate warnings:

```shell
$ curl https://localhost:8443 -v
* Rebuilt URL to: https://localhost:8443/
*   Trying ::1...
* TCP_NODELAY set
* Connected to localhost (::1) port 8443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* Cipher selection: ALL:!EXPORT:!EXPORT40:!EXPORT56:!aNULL:!LOW:!RC4:@STRENGTH
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/cert.pem
  CApath: none
* TLSv1.2 (OUT), TLS handshake, Client hello (1):
* TLSv1.2 (IN), TLS handshake, Server hello (2):
* TLSv1.2 (IN), TLS handshake, Certificate (11):
* TLSv1.2 (OUT), TLS alert, Server hello (2):
* SSL certificate problem: self signed certificate
* stopped the pause stream!
* Closing connection 0
curl: (60) SSL certificate problem: self signed certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl performs SSL certificate verification by default, using a "bundle"
 of Certificate Authority (CA) public keys (CA certs). If the default
 bundle file isn't adequate, you can specify an alternate file
 using the --cacert option.
If this HTTPS server uses a certificate signed by a CA represented in
 the bundle, the certificate verification probably failed due to a
 problem with the certificate (it might be expired, or the name might
 not match the domain name in the URL).
If you'd like to turn off curl's verification of the certificate, use
 the -k (or --insecure) option.
HTTPS-proxy has similar options --proxy-cacert and --proxy-insecure.
```

We wanted to _avoid_ this (since we have set up local tooling to create a
trusted CA, similar to how [devcert](https://github.com/davewasmer/devcert)
does it.)

Now, we already know that we can import the (trusted CA-signed) certificate
like this:

```shell
$ keytool \
    -noprompt \
    -importcert \
    -keystore ~/.ssl/keystore \
    -file ~/.ssl/localhost/certificate.crt \
    -alias mydomain
```

Can we also import the key?

## Converting the certificate and key to PKCS12 format

I
[asked](https://www.google.com/search?q=java+keytool+import+key&ie=utf-8&oe=utf-8)
uncle Google about it, and found [this SO
thread](https://stackoverflow.com/a/8224863/227779)

```shell
$ openssl \
    pkcs12 \
    -export \
    -in ~/.ssl/localhost/certificate.crt \
    -inkey ~/.ssl/localhost/private-key.key \
    -out ~/.ssl/localhost.p12 -name localhost \
    -CAfile ~/.ssl/ca.crt \
    -caname root
```

Note: I tried first without a password, but as suggested in the SO post
this _does not work_:

```
Enter source keystore password:

*****************  WARNING WARNING WARNING  *****************
* The integrity of the information stored in the srckeystore*
* has NOT been verified!  In order to verify its integrity, *
* you must provide the srckeystore password.                *
*****************  WARNING WARNING WARNING  *****************

keytool error: java.lang.NullPointerException: invalid null input
```


```shell
$ keytool \
    -importkeystore \
    -deststorepass blahblah \
    -destkeystore ~/.ssl/keystore \
    -srckeystore ~/.ssl/localhost.p12 \
    -srcstoretype PKCS12 \
    -srcstorepass temp \
    -alias localhost
```

This gave me a warning about using the JKS keystore format, so I wiped the
keystore and re-ran the command with the added `-deststoretype pkcs12`
parameter. Like this:

```shell
$ keytool \
    -importkeystore \
    -deststorepass blahblah \
    -destkeystore ~/.ssl/keystore \
    -deststoretype pkcs12 \
    -srckeystore ~/.ssl/localhost.p12 \
    -srcstoretype PKCS12 \
    -srcstorepass temp \
    -alias localhost
```

That gave me an error, so I decided to go with the JKS format for now:

```
Importing keystore /Users/plundberg/.ssl/localhost.p12 to /Users/plundberg/.ssl/keystore...
keytool error: java.lang.Exception: The destination pkcs12 keystore has different storepass and keypass. Please
retry with -destkeypass specified.
```

I recreated the keystore and started the application server. Now, an
interesting problem appeared; this time I actually _did_ get an error
logged to the Puma console:

```
2018-04-24 10:39:07 +0300: Listen loop error: java.security.UnrecoverableKeyException: Cannot recover key
sun.security.provider.KeyProtector.recover(KeyProtector.java:328)
sun.security.provider.JavaKeyStore.engineGetKey(JavaKeyStore.java:146)
sun.security.provider.JavaKeyStore$JKS.engineGetKey(JavaKeyStore.java:56)
sun.security.provider.KeyStoreDelegator.engineGetKey(KeyStoreDelegator.java:96)
sun.security.provider.JavaKeyStore$DualFormatJKS.engineGetKey(JavaKeyStore.java:70)
java.security.KeyStore.getKey(KeyStore.java:1023)
sun.security.ssl.SunX509KeyManagerImpl.<init>(SunX509KeyManagerImpl.java:133)
sun.security.ssl.KeyManagerFactoryImpl$SunX509.engineInit(KeyManagerFactoryImpl.java:70)
javax.net.ssl.KeyManagerFactory.init(KeyManagerFactory.java:256)
org.jruby.puma.MiniSSL.initialize(MiniSSL.java:151)
org.jruby.puma.MiniSSL$INVOKER$i$1$0$initialize.call(MiniSSL$INVOKER$i$1$0$initialize.gen)
org.jruby.internal.runtime.methods.JavaMethod$JavaMethodN.call(JavaMethod.java:814)
org.jruby.runtime.callsite.CachingCallSite.cacheAndCall(CachingCallSite.java:278)
org.jruby.runtime.callsite.CachingCallSite.call(CachingCallSite.java:79)
org.jruby.RubyClass.newInstance(RubyClass.java:1023)
org.jruby.puma.MiniSSL.server(MiniSSL.java:134)
...
```

I listed the entries in the keystore again (`keytool -list -v -keystore
~/.ssl/keystore`). This time, both the private key (and seemingly the
certificate) as well as the CA certificate was present there.

I looked at the [MiniSSL.java source
code](https://github.com/puma/puma/blob/master/ext/puma_http11/org/jruby/puma/MiniSSL.java)
again and concluded that for things to work, the "key password" should be
the same as the "keystore password". I used [this SO answer](https://stackoverflow.com/a/19532133/227779) to verify this, i.e.:

```shell
$ keytool \
    -keypasswd \
    -new changeit \
    -keystore ~/.ssl/keystore \
    -storepass blahblah \
    -alias localhost \
    -keypass blahblah
keytool error: java.security.UnrecoverableKeyException: Cannot recover key
```

Ah, now I get it! When I converted the certificate and key to PKCS12
format, I entered a password and _that password_ was now being used for the
key.

```shell
$ keytool \
    -keypasswd \
    -new changeit \
    -keystore ~/.ssl/keystore \
    -storepass blahblah \
    -alias localhost \
    -keypass temp

Warning:
The JKS keystore uses a proprietary format. It is recommended to migrate to PKCS12 which is an industry standard format using "keytool -importkeystore -srckeystore /Users/plundberg/.ssl/keystore -destkeystore /Users/plundberg/.ssl/keystore -deststoretype pkcs12".
```

Once I had changed the password to **be the same as the password for the
keystore** (very important!), it worked absolutely brilliant - without
security warnings! :tada: (Remember, I had the CA certificate in the
keychain of my Mac at this time, so this is as it should be.)

Verifying the HTTPS response using `openssl` also looked fine. (I will
disregard the message about "self-signed certificate" at this point, since
the certificate is accepted by both `curl` and Chrome.)

```shell
$ echo "" | openssl s_client -showcerts -connect localhost:8443
CONNECTED(00000005)
depth=1 CN = eCraft uxFactory Server Development certificates
verify error:num=19:self signed certificate in certificate chain
verify return:0
---
Certificate chain
 0 s:/CN=localhost
   i:/CN=eCraft uxFactory Server Development certificates
-----BEGIN CERTIFICATE-----
MIIDsDCCApigAwIBAgIBBDANBgkqhkiG9w0BAQsFADA7MTkwNwYDVQQDDDBlQ3Jh
ZnQgdXhGYWN0b3J5IFNlcnZlciBEZXZlbG9wbWVudCBjZXJ0aWZpY2F0ZXMwHhcN
MTgwNDIzMDgzNjI1WhcNMzcwNjIyMDgzNjI1WjAUMRIwEAYDVQQDDAlsb2NhbGhv
c3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7tRYVXdqDzUtlIVZE
/OefFeD992oWsNiCqJQgjOQEABpYrZ/DUNja+42apYVbLnatm1jnmeym2YpM7OlO
NiRNDePajCnWAj/evOK7LfdY5bJTTUJ57iH4LgeF4Mgf7Zf0L0CxR67jlM7F0CWH
Lb3x6QJIzwkmIEh7yP+qEQwoM6go7MQYz9h59iP4HFL2AcjOrWmgGLG0Gu1jKumY
zjPU+y3FFM/2vz0TYa3+Wq/rwi7T53gTSIdfA2jGglqb4bDRkUvPL2TBVV3Kj1h1
XrFgddRVX6F4rgTdDCbc+gSOnw/4yMrk/dNaKm0L4IiYgeA3dpP1jTV7LvaHQrAw
lWKzAgMBAAGjgeUwgeIwDAYDVR0TAQH/BAIwADAdBgNVHQ4EFgQUXrkVfnl65wl5
EfVp2d8BaE4N/t8wawYDVR0jBGQwYoAUBntwttCHL2I0rCXaEGv7UBD45qWhP6Q9
MDsxOTA3BgNVBAMMMGVDcmFmdCB1eEZhY3RvcnkgU2VydmVyIERldmVsb3BtZW50
IGNlcnRpZmljYXRlc4IJAMYKF8i1x819MA4GA1UdDwEB/wQEAwIFoDATBgNVHSUE
DDAKBggrBgEFBQcDATAhBgNVHREEGjAYggsqLmxvY2FsaG9zdIIJbG9jYWxob3N0
MA0GCSqGSIb3DQEBCwUAA4IBAQBbWXG7UjiVLnIE/tyitJnEHQBYMmpJcRqcxyLp
P3ONwS8ap2KdYaWpyXdQi+tAdQuEHwe2UAOM/eiWJasWlFzH1iEZJ/lnu3slDWxU
ghfuD3c9hAdTe9dWHh1b+EdBf9okBFO0iaQp23zyGZ8iEc4UeBUTnOmSkIeFlZo/
yz29FFHNz+Co1QilkZQMkF8j1Pz+bPw3vRpaVj7QfEExNdVGoRbCzDpvL127kfja
1vNdizKnaDOj2ZqvIoeD5z8AEa4M63YTmscI/ohMGUl+MBA9NZSOjJj/Td45zjxV
s3No2Ik9zo8J51moeB0RLhxZC0VUhxUQ+Rnp/YgORs+Hxm70
-----END CERTIFICATE-----
 1 s:/CN=eCraft uxFactory Server Development certificates
   i:/CN=eCraft uxFactory Server Development certificates
-----BEGIN CERTIFICATE-----
MIIDXzCCAkegAwIBAgIJAMYKF8i1x819MA0GCSqGSIb3DQEBCwUAMDsxOTA3BgNV
BAMMMGVDcmFmdCB1eEZhY3RvcnkgU2VydmVyIERldmVsb3BtZW50IGNlcnRpZmlj
YXRlczAeFw0xODA0MTgxMDAxMjZaFw0zNzA2MTcxMDAxMjZaMDsxOTA3BgNVBAMM
MGVDcmFmdCB1eEZhY3RvcnkgU2VydmVyIERldmVsb3BtZW50IGNlcnRpZmljYXRl
czCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMGIXXGXryPI9xzHyR4b
KLnfcYdwRXAoTWWpmGFV3shs7kwIRdze+XuszA9n9S0KvwV1Kr2aIOIN6+kJXaYq
TaVqX0qSFYPeGSaVVhh7YWlOLpveXPGEz0GqLNjXCqNahYlC4zXVwCU67sjbN0mB
rP+qhwBW1tx5ud/gszeB2IJYFGIvctoZ1nadq6su2t5wv4ZD1sRHmAY6IvAVdYai
aYS56Qjd2RVst/FhMKkJSbJQEQ6UGHTM244J2inyh+FXzFTOWBGRWvmYS7NmguQT
RnoyPSyIemE8PYyleTnts9YTBAzEaejB9Gv+87tjtsj/46/1U28pB4l+doTSANsJ
FqUCAwEAAaNmMGQwHQYDVR0OBBYEFAZ7cLbQhy9iNKwl2hBr+1AQ+OalMB8GA1Ud
IwQYMBaAFAZ7cLbQhy9iNKwl2hBr+1AQ+OalMBIGA1UdEwEB/wQIMAYBAf8CAQAw
DgYDVR0PAQH/BAQDAgGGMA0GCSqGSIb3DQEBCwUAA4IBAQBvrjhsf2otj46e/qIz
tvnZ3LgFa7fD+OAO/4M8uakTyn+m8QKKdnM7kf2CKhEx3ZIumI0QYdj3ICnYo918
sGNdlxCizPIMhE0dXQh95opAjX2/bfGdut9WYnu1t8UgbV5yAKntnaLqz3ZaVR1K
XnkdEdj4xJj87KqwV0BwtWKWxKBgLclu4VXwq/Psi2M/gzaAsi7LeGgz+DXr0zyw
vo2ngABf5DXYB++r11NkpyZ6LpUHn8dVOfP+Po8DQcl4X6clDBkvssDXOZAhzA9e
TbxPQ9vec2GbDUWj7KMtVq+TpVgSBVwVdTrCMiOhVzSCZdWNRrrmgto6xldcZ1Ys
Sidb
-----END CERTIFICATE-----
---
Server certificate
subject=/CN=localhost
issuer=/CN=eCraft uxFactory Server Development certificates
---
No client certificate CA names sent
---
SSL handshake has read 2382 bytes and written 524 bytes
---
New, TLSv1/SSLv3, Cipher is ECDHE-RSA-AES128-GCM-SHA256
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES128-GCM-SHA256
    Session-ID: 5ADEED1DB64038AA551A96C5020AB2E71C8662EE23CE45EAEC5AB36215D0C920
    Session-ID-ctx:
    Master-Key: 499715428CF760FEDA2776BB07946AFD186D940A5535086908F76CAD1E753489A8A2E1D0634FD53661D2FE0015A41325
    Start Time: 1524559133
    Timeout   : 300 (sec)
    Verify return code: 0 (ok)
---
DONE
```

## Wrapping up

The Java `keytool` tool is awkward to work with; I'd much rather just have
a loose `.crt` and` .key` file laying on disk in this case.

Some of the problems turned out to be simple PEBKAC errors from my end. I'm
happy about that; they are usually much simpler to resolve than actual
_bugs_ in software.

Anyway, I'm happy that I managed to finally solve the problem and get HTTPS
working _without certificate warnings_. It took me a few hours but it feels
worthwhile since at least I managed to get things working at the end.

I hope this blog post helped you as well!

## Further reading

- [Stack Overflow: How to import an existing x509 certificate and private key in Java keystore to use in SSL?](https://stackoverflow.com/a/19532133/227779)
- [Stack Overflow: Caused by: java.security.UnrecoverableKeyException: Cannot recover key](https://stackoverflow.com/questions/15967650/caused-by-java-security-unrecoverablekeyexception-cannot-recover-key)
- [devcert](https://github.com/davewasmer/devcert), an excellent Node.js
  package for dealing with localhost certificates.
- [Converting a certificate chain and key into a Java Keystore for SSL on
  Puma/Java](https://coderwall.com/p/psnkyq/converting-a-certificate-chain-and-key-into-a-java-keystore-for-ssl-on-puma-java),
  a blog post by Hannan.
