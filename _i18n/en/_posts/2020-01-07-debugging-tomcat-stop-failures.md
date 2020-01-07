Symptom: you have a server where Tomcat supposedly survives as `systemd` service stop command:

```
$ sudo systemctl stop tomcat8
$ ps -fe | grep catalina
tomcat8    2577      1 51 08:18 ?        00:08:01 /usr/lib/jvm/adoptopenjdk-8-hotspot-amd64/bin/java -D<various-properties...> -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -classpath /usr/share/tomcat8/bin/bootstrap.jar:/usr/share/tomcat8/bin/tomcat-juli.jar -Dcatalina.base=/var/lib/tomcat8 -Dcatalina.home=/usr/share/tomcat8 -Djava.io.tmpdir=/tmp/tomcat8-tomcat8-tmp org.apache.catalina.startup.Bootstrap start
```

You want to dig deeper into why this is happening. Then, this blog post is for you.

- Get thread dump:

$ jstack -l 2577
2577: Operation not permitted
$ sudo -u tomcat8 jstack -l 2577 > /tmp/threads.txt
```

Threads:

```
2020-01-07 08:38:17
Full thread dump OpenJDK 64-Bit Server VM (25.232-b09 mixed mode):

"Attach Listener" #407 daemon prio=9 os_prio=0 tid=0x00007f2a5c00e000 nid=0x2c93 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"ForkJoinPool.commonPool-worker-8" #406 daemon prio=5 os_prio=0 tid=0x00007f29dc002000 nid=0x2c6e waiting on condition [0x00007f28e7ffe000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c855bb50> (a java.util.concurrent.ForkJoinPool)
	at java.util.concurrent.ForkJoinPool.awaitWork(ForkJoinPool.java:1824)
	at java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1693)
	at java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:157)

   Locked ownable synchronizers:
	- None

"ForkJoinPool-1-worker-13" #405 daemon prio=5 os_prio=0 tid=0x00007f29201eb800 nid=0x2c6b waiting on condition [0x00007f28cf3d7000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84211c0> (a java.util.concurrent.ForkJoinPool)
	at java.util.concurrent.ForkJoinPool.awaitWork(ForkJoinPool.java:1824)
	at java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1693)
	at java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:157)

   Locked ownable synchronizers:
	- None

"ForkJoinPool-1-worker-4" #404 daemon prio=5 os_prio=0 tid=0x00007f2ae839f000 nid=0x2c6a waiting on condition [0x00007f2a6c5bb000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84211c0> (a java.util.concurrent.ForkJoinPool)
	at java.util.concurrent.ForkJoinPool.awaitWork(ForkJoinPool.java:1824)
	at java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1693)
	at java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:157)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-scheduled-20" #403 daemon prio=5 os_prio=0 tid=0x00007f29fc002800 nid=0x2c44 waiting on condition [0x00007f28c63af000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8543638> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1129)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"Thread-49" #384 daemon prio=5 os_prio=0 tid=0x00007f29340d3800 nid=0x19e8 waiting on condition [0x00007f28b9d71000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000005da500360> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"ForkJoinPool-1-worker-11" #382 daemon prio=5 os_prio=0 tid=0x00007f291c006800 nid=0x19e4 waiting on condition [0x00007f29e49c3000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84211c0> (a java.util.concurrent.ForkJoinPool)
	at java.util.concurrent.ForkJoinPool.awaitWork(ForkJoinPool.java:1824)
	at java.util.concurrent.ForkJoinPool.runWorker(ForkJoinPool.java:1693)
	at java.util.concurrent.ForkJoinWorkerThread.run(ForkJoinWorkerThread.java:157)

   Locked ownable synchronizers:
	- None

"Thread-9 (ActiveMQ-client-netty-threads)" #328 daemon prio=5 os_prio=0 tid=0x00007f2a50042800 nid=0xfd6 runnable [0x00007f28b8f65000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"event-queue-producer-service-1" #327 daemon prio=5 os_prio=0 tid=0x00007f2a50040800 nid=0xfd5 waiting on condition [0x00007f28b9066000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ee4001a0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueProducerService$Worker.run(EventQueueProducerService.java:205)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004ee4004b0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"polling-notifications-cleanup" #325 daemon prio=5 os_prio=0 tid=0x00007f2a181a3800 nid=0xfd3 waiting on condition [0x00007f28b9468000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed900950> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"fcm-delivery" #324 daemon prio=5 os_prio=0 tid=0x00007f2a1819a000 nid=0xfd2 runnable [0x00007f28b9569000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed900b98> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at fi.hibox.centre.server.managers.notification.FCMConnectionManager.deliverNotificationFromQueue(FCMConnectionManager.java:127)
	at fi.hibox.centre.server.managers.notification.FCMNotificationManager$ServerDeliverer.run(FCMNotificationManager.java:222)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at com.google.common.util.concurrent.TrustedListenableFutureTask$TrustedFutureInterruptibleTask.runInterruptibly(TrustedListenableFutureTask.java:125)
	at com.google.common.util.concurrent.InterruptibleTask.run(InterruptibleTask.java:57)
	at com.google.common.util.concurrent.TrustedListenableFutureTask.run(TrustedListenableFutureTask.java:78)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004ed900cb8> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"mq-unknown-destination-worker" #323 daemon prio=5 os_prio=0 tid=0x00007f2a18143800 nid=0xfd1 waiting on condition [0x00007f28b966a000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at fi.hibox.centre.server.managers.notification.MessageQueueManager$UnknownDestinationCleanup.run(MessageQueueManager.java:690)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at com.google.common.util.concurrent.TrustedListenableFutureTask$TrustedFutureInterruptibleTask.runInterruptibly(TrustedListenableFutureTask.java:125)
	at com.google.common.util.concurrent.InterruptibleTask.run(InterruptibleTask.java:57)
	at com.google.common.util.concurrent.TrustedListenableFutureTask.run(TrustedListenableFutureTask.java:78)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004ed900f50> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"recorder" #322 daemon prio=5 os_prio=0 tid=0x00007f291c043000 nid=0xfd0 waiting on condition [0x00007f28b976b000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed901170> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#8]" #320 daemon prio=5 os_prio=0 tid=0x00007f297800b800 nid=0xfc8 waiting on condition [0x00007f28b996d000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#7]" #317 daemon prio=5 os_prio=0 tid=0x00007f29b0006800 nid=0xfc5 waiting on condition [0x00007f28b9c70000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#6]" #315 daemon prio=5 os_prio=0 tid=0x00007f294408e800 nid=0xfc3 waiting on condition [0x00007f28b9e72000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#5]" #311 daemon prio=5 os_prio=0 tid=0x00007f297800a800 nid=0xfbf waiting on condition [0x00007f28ba276000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#4]" #309 daemon prio=5 os_prio=0 tid=0x00007f29b0005800 nid=0xfbd waiting on condition [0x00007f290e5e8000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#3]" #306 daemon prio=5 os_prio=0 tid=0x00007f2944480800 nid=0xfba waiting on condition [0x00007f28cf5d9000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#2]" #303 daemon prio=5 os_prio=0 tid=0x00007f2978005800 nid=0xfb7 waiting on condition [0x00007f28bad7d000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][listener][T#1]" #300 daemon prio=5 os_prio=0 tid=0x00007f29b0005000 nid=0xfb4 waiting on condition [0x00007f2a6c2b8000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed9015e0> (a java.util.concurrent.LinkedTransferQueue)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:737)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.take(LinkedTransferQueue.java:1269)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][generic][T#5]" #296 daemon prio=5 os_prio=0 tid=0x00007f291c004000 nid=0xf8f waiting on condition [0x00007f28c6fb9000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903350> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][management][T#5]" #294 daemon prio=5 os_prio=0 tid=0x00007f29c0003800 nid=0xf80 waiting on condition [0x00007f28ba678000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903128> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][management][T#4]" #293 daemon prio=5 os_prio=0 tid=0x00007f29c0002000 nid=0xf7f waiting on condition [0x00007f28ba779000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903128> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][generic][T#4]" #292 daemon prio=5 os_prio=0 tid=0x00007f291c002000 nid=0xf7e waiting on condition [0x00007f28ba87a000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903350> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#32]" #288 daemon prio=5 os_prio=0 tid=0x00007f2914b3c000 nid=0xf7a runnable [0x00007f28bbe7f000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed9035d0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed9035c0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed9035e8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#31]" #287 daemon prio=5 os_prio=0 tid=0x00007f2914b3a800 nid=0xf79 runnable [0x00007f28bbf80000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee4016d8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ee4016c8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee4016f0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#30]" #286 daemon prio=5 os_prio=0 tid=0x00007f2914b38800 nid=0xf78 runnable [0x00007f28bc081000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edd02f70> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004edd02f60> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edd02f88> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#29]" #285 daemon prio=5 os_prio=0 tid=0x00007f2914b37000 nid=0xf77 runnable [0x00007f28be184000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed9038b8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed9038a8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed9038d0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#28]" #284 daemon prio=5 os_prio=0 tid=0x00007f2914b35800 nid=0xf76 runnable [0x00007f28be285000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed903ba0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed903b90> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed903bb8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#27]" #283 daemon prio=5 os_prio=0 tid=0x00007f2914b33800 nid=0xf75 runnable [0x00007f28be386000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed903e88> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed903e78> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed903ea0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#26]" #282 daemon prio=5 os_prio=0 tid=0x00007f2914b32000 nid=0xf74 runnable [0x00007f28be487000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda00320> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda00310> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda00338> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#25]" #281 daemon prio=5 os_prio=0 tid=0x00007f2914b30000 nid=0xf73 runnable [0x00007f28be588000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904170> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904160> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed904188> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#24]" #280 daemon prio=5 os_prio=0 tid=0x00007f2914b2e000 nid=0xf72 runnable [0x00007f28be689000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edd03258> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004edd03248> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edd03270> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#23]" #279 daemon prio=5 os_prio=0 tid=0x00007f2914b2c800 nid=0xf71 runnable [0x00007f28be78a000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee4019c0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ee4019b0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee4019d8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#22]" #278 daemon prio=5 os_prio=0 tid=0x00007f2914b2b000 nid=0xf70 runnable [0x00007f28be88b000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904458> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904448> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed904470> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#21]" #277 daemon prio=5 os_prio=0 tid=0x00007f2914b29000 nid=0xf6f runnable [0x00007f28be98c000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda00608> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda005f8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda00620> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#20]" #276 daemon prio=5 os_prio=0 tid=0x00007f2914b27800 nid=0xf6e runnable [0x00007f28bea8d000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904740> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904730> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed904758> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#19]" #275 daemon prio=5 os_prio=0 tid=0x00007f2914b25800 nid=0xf6d runnable [0x00007f28beb8e000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda008f0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda008e0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda00908> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#18]" #274 daemon prio=5 os_prio=0 tid=0x00007f2914b24000 nid=0xf6c runnable [0x00007f28bec8f000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee401ca8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ee401c98> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee401cc0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#17]" #273 daemon prio=5 os_prio=0 tid=0x00007f2914b19800 nid=0xf6b runnable [0x00007f28bed90000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904a28> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904a18> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed904a40> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#16]" #272 daemon prio=5 os_prio=0 tid=0x00007f2914b16000 nid=0xf6a runnable [0x00007f28c0e93000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda00bd8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda00bc8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda00bf0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#15]" #271 daemon prio=5 os_prio=0 tid=0x00007f2914b14000 nid=0xf69 runnable [0x00007f28c0f94000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edd03540> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004edd03530> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edd03558> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#14]" #270 daemon prio=5 os_prio=0 tid=0x00007f2914b12000 nid=0xf68 runnable [0x00007f28c1095000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda00ec0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda00eb0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda00ed8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#13]" #269 daemon prio=5 os_prio=0 tid=0x00007f2914b10800 nid=0xf67 runnable [0x00007f28c1196000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904d10> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904d00> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed904d28> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#12]" #268 daemon prio=5 os_prio=0 tid=0x00007f2914b0e800 nid=0xf66 runnable [0x00007f28c1297000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ede02690> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ede02680> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ede026a8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#11]" #267 daemon prio=5 os_prio=0 tid=0x00007f2914b0c800 nid=0xf65 runnable [0x00007f28c1398000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda011a8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda01198> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda011c0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#10]" #266 daemon prio=5 os_prio=0 tid=0x00007f2914b0a800 nid=0xf64 runnable [0x00007f28c1499000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee401f90> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ee401f80> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee401fa8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#9]" #265 daemon prio=5 os_prio=0 tid=0x00007f2914b09000 nid=0xf63 runnable [0x00007f28c159a000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed904ff8> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed904fe8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed905010> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#8]" #264 daemon prio=5 os_prio=0 tid=0x00007f2914b07000 nid=0xf62 runnable [0x00007f28c169b000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda01490> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda01480> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda014a8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#7]" #263 daemon prio=5 os_prio=0 tid=0x00007f2914b05800 nid=0xf61 runnable [0x00007f28c179c000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda01778> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda01768> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda01790> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#6]" #262 daemon prio=5 os_prio=0 tid=0x00007f2914b04000 nid=0xf60 runnable [0x00007f28c189d000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edd03828> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004edd03818> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edd03840> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#5]" #261 daemon prio=5 os_prio=0 tid=0x00007f2914b02000 nid=0xf5f runnable [0x00007f28c199e000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed9052e0> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed9052d0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed9052f8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#4]" #260 daemon prio=5 os_prio=0 tid=0x00007f2914b00800 nid=0xf5e runnable [0x00007f28c1a9f000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee402278> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ee402268> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee402290> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][generic][T#3]" #259 daemon prio=5 os_prio=0 tid=0x00007f292c097000 nid=0xf5d waiting on condition [0x00007f28c1ba0000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903350> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][generic][T#1]" #258 daemon prio=5 os_prio=0 tid=0x00007f2928031000 nid=0xf5c waiting on condition [0x00007f28c1ca1000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903350> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][generic][T#2]" #257 daemon prio=5 os_prio=0 tid=0x00007f293403f000 nid=0xf5b waiting on condition [0x00007f28c1da2000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903350> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#2]" #256 daemon prio=5 os_prio=0 tid=0x00007f292400c800 nid=0xf5a runnable [0x00007f28c4ea6000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda01c08> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004eda01bf8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda01c20> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#3]" #255 daemon prio=5 os_prio=0 tid=0x00007f29201b8800 nid=0xf59 runnable [0x00007f28c4fa7000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edc03860> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004edc03850> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edc03878> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][transport_worker][T#1]" #254 daemon prio=5 os_prio=0 tid=0x00007f2918004000 nid=0xf58 runnable [0x00007f28c50a8000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed905918> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004ed905908> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed905930> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][management][T#3]" #253 daemon prio=5 os_prio=0 tid=0x00007f2914afe800 nid=0xf57 waiting on condition [0x00007f28c51a9000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903128> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][management][T#2]" #252 daemon prio=5 os_prio=0 tid=0x00007f2914afc800 nid=0xf56 waiting on condition [0x00007f28c52aa000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903128> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][management][T#1]" #251 daemon prio=5 os_prio=0 tid=0x00007f2914aee000 nid=0xf55 waiting on condition [0x00007f28c53ab000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed903128> (a org.elasticsearch.common.util.concurrent.EsExecutors$ExecutorScalingQueue)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.LinkedTransferQueue.awaitMatch(LinkedTransferQueue.java:734)
	at java.util.concurrent.LinkedTransferQueue.xfer(LinkedTransferQueue.java:647)
	at java.util.concurrent.LinkedTransferQueue.poll(LinkedTransferQueue.java:1277)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][scheduler][T#1]" #250 daemon prio=5 os_prio=0 tid=0x00007f2914787800 nid=0xf54 runnable [0x00007f28c56ac000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004ed905ba8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"elasticsearch[_client_][[timer]]" #249 daemon prio=5 os_prio=0 tid=0x00007f29142b0000 nid=0xf53 sleeping[0x00007f28c5fad000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at org.elasticsearch.threadpool.ThreadPool$CachedTimeThread.run(ThreadPool.java:593)

   Locked ownable synchronizers:
	- None

"logback-8" #246 daemon prio=5 os_prio=0 tid=0x00007f2a6000b000 nid=0xf45 waiting on condition [0x00007f28c64b0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 16" #245 prio=5 os_prio=0 tid=0x00007f29941ab000 nid=0xf44 runnable [0x00007f28c67b1000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda02230> (a sun.nio.ch.Util$3)
	- locked <0x00000004eda02220> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda02240> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 15" #244 prio=5 os_prio=0 tid=0x00007f29941a9800 nid=0xf43 runnable [0x00007f28c68b2000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edc03b48> (a sun.nio.ch.Util$3)
	- locked <0x00000004edc03b38> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edc03b58> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 14" #243 prio=5 os_prio=0 tid=0x00007f29941a7800 nid=0xf42 runnable [0x00007f28c69b3000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed905e40> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed905e30> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed905e50> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 13" #242 prio=5 os_prio=0 tid=0x00007f29941a6000 nid=0xf41 runnable [0x00007f28c6ab4000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edd03cb8> (a sun.nio.ch.Util$3)
	- locked <0x00000004edd03ca8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edd03cc8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 12" #241 prio=5 os_prio=0 tid=0x00007f29941a4800 nid=0xf40 runnable [0x00007f28c6bb5000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ee4028d0> (a sun.nio.ch.Util$3)
	- locked <0x00000004ee4028c0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ee4028e0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 11" #240 prio=5 os_prio=0 tid=0x00007f29941a2800 nid=0xf3f runnable [0x00007f28c6cb6000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed9060e8> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed9060d8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed9060f8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 10" #239 prio=5 os_prio=0 tid=0x00007f29941a1800 nid=0xf3e runnable [0x00007f28c6db7000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda024c0> (a sun.nio.ch.Util$3)
	- locked <0x00000004eda024b0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda024d0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 9" #238 prio=5 os_prio=0 tid=0x00007f29941a0000 nid=0xf3d runnable [0x00007f290c4bf000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edc03dd8> (a sun.nio.ch.Util$3)
	- locked <0x00000004edc03dc8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edc03de8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 8" #237 prio=5 os_prio=0 tid=0x00007f299419f000 nid=0xf3c runnable [0x00007f28d16e7000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed906378> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed906368> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed906388> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 7" #236 prio=5 os_prio=0 tid=0x00007f299419e000 nid=0xf3b runnable [0x00007f28d12e3000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda02750> (a sun.nio.ch.Util$3)
	- locked <0x00000004eda02740> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda02760> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 6" #235 prio=5 os_prio=0 tid=0x00007f299419d000 nid=0xf3a runnable [0x00007f28d15e6000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edc04068> (a sun.nio.ch.Util$3)
	- locked <0x00000004edc04058> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edc04078> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 5" #234 prio=5 os_prio=0 tid=0x00007f299419c000 nid=0xf39 runnable [0x00007f28d13e4000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed906608> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed9065f8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed906618> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 4" #233 prio=5 os_prio=0 tid=0x00007f299419b000 nid=0xf38 runnable [0x00007f28d14e5000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda029e0> (a sun.nio.ch.Util$3)
	- locked <0x00000004eda029d0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda029f0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 3" #232 prio=5 os_prio=0 tid=0x00007f299419a000 nid=0xf37 runnable [0x00007f28d11e2000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed906898> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed906888> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed9068a8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 2" #231 prio=5 os_prio=0 tid=0x00007f2994199000 nid=0xf36 runnable [0x00007f28d00e0000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004eda02c70> (a sun.nio.ch.Util$3)
	- locked <0x00000004eda02c60> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004eda02c80> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 1" #230 prio=5 os_prio=0 tid=0x00007f2994198000 nid=0xf35 runnable [0x00007f297d0f3000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004edc042f8> (a sun.nio.ch.Util$3)
	- locked <0x00000004edc042e8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004edc04308> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-8-thread-1" #229 prio=5 os_prio=0 tid=0x00007f2948041000 nid=0xf34 runnable [0x00007f28ccdd1000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004ed906b28> (a sun.nio.ch.Util$3)
	- locked <0x00000004ed906b18> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004ed906b38> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor.execute(AbstractMultiworkerIOReactor.java:343)
	at org.apache.http.impl.nio.conn.PoolingNHttpClientConnectionManager.execute(PoolingNHttpClientConnectionManager.java:221)
	at org.apache.http.impl.nio.client.CloseableHttpAsyncClientBase$1.run(CloseableHttpAsyncClientBase.java:64)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"logback-7" #228 daemon prio=5 os_prio=0 tid=0x00007f29a4008800 nid=0xf23 waiting on condition [0x00007f28c6eb8000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-1-thread-5" #226 daemon prio=5 os_prio=0 tid=0x00007f2a4c00d800 nid=0xf17 waiting on condition [0x00007f28c70ba000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0ae3490> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"logback-6" #225 daemon prio=5 os_prio=0 tid=0x00007f2998001800 nid=0xf0b waiting on condition [0x00007f290cbd0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"centre-common-scheduled-4" #224 daemon prio=5 os_prio=0 tid=0x00007f298c22d000 nid=0xf06 waiting on condition [0x00007f28c81bc000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8563050> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1129)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"MariaDb-bulk-5" #223 daemon prio=5 os_prio=0 tid=0x00007f299c048800 nid=0xefe waiting on condition [0x00007f28c82bd000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c4800808> (a java.util.concurrent.SynchronousQueue$TransferStack)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.SynchronousQueue$TransferStack.awaitFulfill(SynchronousQueue.java:458)
	at java.util.concurrent.SynchronousQueue$TransferStack.transfer(SynchronousQueue.java:362)
	at java.util.concurrent.SynchronousQueue.take(SynchronousQueue.java:924)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"MariaDb-bulk-4" #222 daemon prio=5 os_prio=0 tid=0x00007f299c046800 nid=0xefc waiting on condition [0x00007f28c83be000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c4800808> (a java.util.concurrent.SynchronousQueue$TransferStack)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.SynchronousQueue$TransferStack.awaitFulfill(SynchronousQueue.java:458)
	at java.util.concurrent.SynchronousQueue$TransferStack.transfer(SynchronousQueue.java:362)
	at java.util.concurrent.SynchronousQueue.take(SynchronousQueue.java:924)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"MariaDb-bulk-3" #221 daemon prio=5 os_prio=0 tid=0x00007f299c046000 nid=0xefb waiting on condition [0x00007f28c84bf000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c4800808> (a java.util.concurrent.SynchronousQueue$TransferStack)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.SynchronousQueue$TransferStack.awaitFulfill(SynchronousQueue.java:458)
	at java.util.concurrent.SynchronousQueue$TransferStack.transfer(SynchronousQueue.java:362)
	at java.util.concurrent.SynchronousQueue.take(SynchronousQueue.java:924)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"MariaDb-bulk-2" #220 daemon prio=5 os_prio=0 tid=0x00007f299c03c800 nid=0xefa waiting on condition [0x00007f28c87c0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c4800808> (a java.util.concurrent.SynchronousQueue$TransferStack)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.SynchronousQueue$TransferStack.awaitFulfill(SynchronousQueue.java:458)
	at java.util.concurrent.SynchronousQueue$TransferStack.transfer(SynchronousQueue.java:362)
	at java.util.concurrent.SynchronousQueue.take(SynchronousQueue.java:924)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-1-thread-4" #219 daemon prio=5 os_prio=0 tid=0x00007f2a4c00c000 nid=0xef9 waiting on condition [0x00007f29e79dd000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0ae3490> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"Thread-8 (ActiveMQ-client-netty-threads)" #217 daemon prio=5 os_prio=0 tid=0x00007f2ac8004800 nid=0xeea runnable [0x00007f28ca9c4000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"event-queue-producer-service-2" #216 daemon prio=5 os_prio=0 tid=0x00007f2a54005000 nid=0xee9 waiting on condition [0x00007f28caac5000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c5100588> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueProducerService$Worker.run(EventQueueProducerService.java:205)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c5100898> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"logback-5" #215 daemon prio=5 os_prio=0 tid=0x00007f29d8007800 nid=0xee8 waiting on condition [0x00007f28cabc6000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"MariaDb-bulk-1" #214 daemon prio=5 os_prio=0 tid=0x00007f299c057800 nid=0xee7 waiting on condition [0x00007f28cacc7000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c4800808> (a java.util.concurrent.SynchronousQueue$TransferStack)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.SynchronousQueue$TransferStack.awaitFulfill(SynchronousQueue.java:458)
	at java.util.concurrent.SynchronousQueue$TransferStack.transfer(SynchronousQueue.java:362)
	at java.util.concurrent.SynchronousQueue.take(SynchronousQueue.java:924)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-1-thread-3" #209 daemon prio=5 os_prio=0 tid=0x00007f2a4c007800 nid=0xed9 waiting on condition [0x00007f28cafc8000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0ae3490> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"SimplePauseDetectorThread_2" #207 daemon prio=5 os_prio=0 tid=0x00007f2a74013000 nid=0xed1 sleeping[0x00007f28cb2c9000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at java.lang.Thread.sleep(Thread.java:340)
	at java.util.concurrent.TimeUnit.sleep(TimeUnit.java:386)
	at org.LatencyUtils.TimeServices.sleepNanos(TimeServices.java:62)
	at org.LatencyUtils.SimplePauseDetector$SimplePauseDetectorThread.run(SimplePauseDetector.java:116)

   Locked ownable synchronizers:
	- None

"SimplePauseDetectorThread_1" #206 daemon prio=5 os_prio=0 tid=0x00007f2a74011800 nid=0xed0 sleeping[0x00007f28cb3ca000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at java.lang.Thread.sleep(Thread.java:340)
	at java.util.concurrent.TimeUnit.sleep(TimeUnit.java:386)
	at org.LatencyUtils.TimeServices.sleepNanos(TimeServices.java:62)
	at org.LatencyUtils.SimplePauseDetector$SimplePauseDetectorThread.run(SimplePauseDetector.java:116)

   Locked ownable synchronizers:
	- None

"SimplePauseDetectorThread_0" #205 daemon prio=5 os_prio=0 tid=0x00007f2a74010800 nid=0xecf sleeping[0x00007f28cb4cb000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at java.lang.Thread.sleep(Thread.java:340)
	at java.util.concurrent.TimeUnit.sleep(TimeUnit.java:386)
	at org.LatencyUtils.TimeServices.sleepNanos(TimeServices.java:62)
	at org.LatencyUtils.SimplePauseDetector$SimplePauseDetectorThread.run(SimplePauseDetector.java:116)

   Locked ownable synchronizers:
	- None

"Thread-29" #204 daemon prio=5 os_prio=0 tid=0x00007f2a7400d800 nid=0xece waiting on condition [0x00007f28cb5cc000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84217b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.LatencyUtils.PauseDetector$PauseDetectorThread.run(PauseDetector.java:85)

   Locked ownable synchronizers:
	- None

"lettuce-epollEventLoop-8-1" #203 daemon prio=5 os_prio=0 tid=0x00007f2910250000 nid=0xecd runnable [0x00007f28cc6ce000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"lettuce-eventExecutorLoop-6-1" #202 daemon prio=5 os_prio=0 tid=0x00007f29100fe000 nid=0xecc waiting on condition [0x00007f28cc9cf000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c853c028> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at io.netty.util.concurrent.SingleThreadEventExecutor.takeTask(SingleThreadEventExecutor.java:251)
	at io.netty.util.concurrent.DefaultEventExecutor.run(DefaultEventExecutor.java:64)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"logback-4" #200 daemon prio=5 os_prio=0 tid=0x00007f29a4008000 nid=0xec5 waiting on condition [0x00007f28ccad0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"Thread-7 (ActiveMQ-client-netty-threads)" #198 daemon prio=5 os_prio=0 tid=0x00007f2a5c001800 nid=0xebb runnable [0x00007f28ceed4000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"event-queue-producer-service-1" #197 daemon prio=5 os_prio=0 tid=0x00007f2a54002800 nid=0xeba waiting on condition [0x00007f28cefd5000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c85423f8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueProducerService$Worker.run(EventQueueProducerService.java:205)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8542708> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"media-change-manager-3" #196 daemon prio=5 os_prio=0 tid=0x00007f2a4812e000 nid=0xeb9 waiting on condition [0x00007f28cf0d6000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8593090> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.server.managers.MediaChangeManager$InternalEventToProtobufWorker.run(MediaChangeManager.java:1788)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8593140> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"media-change-manager-2" #195 daemon prio=5 os_prio=0 tid=0x00007f2a4812d800 nid=0xeb8 waiting on condition [0x00007f297dff6000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c856d240> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.server.managers.MediaChangeManager$Worker.run(MediaChangeManager.java:1657)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c856d2f0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"centre-common-10" #189 daemon prio=5 os_prio=0 tid=0x00007f2a280f2800 nid=0xea9 waiting on condition [0x00007f28cf6da000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-9" #188 daemon prio=5 os_prio=0 tid=0x00007f295c3e6000 nid=0xea8 waiting on condition [0x00007f28cf7db000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-8" #187 daemon prio=5 os_prio=0 tid=0x00007f295c3e4000 nid=0xea7 waiting on condition [0x00007f28cf8dc000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"recording-server-3592625-action-wrkr" #186 daemon prio=5 os_prio=0 tid=0x00007f295c3e3800 nid=0xea6 waiting on condition [0x00007f28cfade000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8543010> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at fi.hibox.centre.server.managers.recording.RecordingServerActionQueue$ActionWorker.run(RecordingServerActionQueue.java:161)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"armeria-boss-http-*:9362" #185 prio=5 os_prio=0 tid=0x00007f2a201de800 nid=0xea5 runnable [0x00007f28cf9dd000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"centre-common-7" #183 daemon prio=5 os_prio=0 tid=0x00007f295c3d5000 nid=0xea3 waiting on condition [0x00007f28cfbdf000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-6" #182 daemon prio=5 os_prio=0 tid=0x00007f295c3d4800 nid=0xea2 waiting on condition [0x00007f2a6c4ba000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"Thread-6 (ActiveMQ-client-netty-threads)" #174 daemon prio=5 os_prio=0 tid=0x00007f29f1030000 nid=0xe99 runnable [0x00007f28d27e9000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-scheduled-1" #173 daemon prio=5 os_prio=0 tid=0x00007f2914208000 nid=0xe98 waiting on condition [0x00007f28d28ea000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8543638> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1134)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-handler-5" #172 daemon prio=5 os_prio=0 tid=0x00007f2914206000 nid=0xe97 in Object.wait() [0x00007f28d29eb000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c853c488> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c853c7a0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"Thread-5 (ActiveMQ-client-netty-threads)" #171 daemon prio=5 os_prio=0 tid=0x00007f29e807f000 nid=0xe95 runnable [0x00007f28d5aef000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-handler-4" #170 daemon prio=5 os_prio=0 tid=0x00007f2914203800 nid=0xe94 in Object.wait() [0x00007f28d5bf0000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c84234b8> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c84234b8> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8423820> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"Thread-4 (ActiveMQ-client-netty-threads)" #169 daemon prio=5 os_prio=0 tid=0x00007f29e001e800 nid=0xe92 runnable [0x00007f28d7cf3000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-handler-3" #168 daemon prio=5 os_prio=0 tid=0x00007f2914202000 nid=0xe91 in Object.wait() [0x00007f28d7df4000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c85438a0> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8599a10> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"Thread-3 (ActiveMQ-client-netty-threads)" #167 daemon prio=5 os_prio=0 tid=0x00007f29dc004800 nid=0xe8f runnable [0x00007f28dcefa000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-handler-2" #166 daemon prio=5 os_prio=0 tid=0x00007f2914201800 nid=0xe8e in Object.wait() [0x00007f28dcffb000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c856d670> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c856d970> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"Thread-4 (ActiveMQ-client-global-scheduled-threads)" #165 daemon prio=5 os_prio=0 tid=0x00007f29c8001800 nid=0xe8d waiting on condition [0x00007f28e41ef000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84239f0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-3 (ActiveMQ-client-global-scheduled-threads)" #164 daemon prio=5 os_prio=0 tid=0x00007f29cc007000 nid=0xe8c waiting on condition [0x00007f28e42f0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84239f0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-1 (ActiveMQ-client-global-scheduled-threads)" #163 daemon prio=5 os_prio=0 tid=0x00007f295c3c6000 nid=0xe8b waiting on condition [0x00007f28e43f1000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84239f0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-2 (ActiveMQ-client-global-scheduled-threads)" #162 daemon prio=5 os_prio=0 tid=0x00007f29b8004800 nid=0xe8a runnable [0x00007f28e44f2000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84239f0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-0 (ActiveMQ-client-global-scheduled-threads)" #161 daemon prio=5 os_prio=0 tid=0x00007f292c071000 nid=0xe89 waiting on condition [0x00007f28e45f3000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84239f0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-2 (ActiveMQ-client-netty-threads)" #160 daemon prio=5 os_prio=0 tid=0x00007f29b8003000 nid=0xe87 runnable [0x00007f28e76f7000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"media-indexer-383680-handler-1" #159 daemon prio=5 os_prio=0 tid=0x00007f29141f0000 nid=0xe86 in Object.wait() [0x00007f28e77f8000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c8599d90> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c8599d90> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c859a0a8> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"Thread-1 (ActiveMQ-client-netty-threads)" #156 daemon prio=5 os_prio=0 tid=0x00007f292c05d000 nid=0xe7d runnable [0x00007f28e7cfb000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"Thread-0 (ActiveMQ-client-netty-threads)" #155 daemon prio=5 os_prio=0 tid=0x00007f295c3a5000 nid=0xe7c runnable [0x00007f28e7dfc000]
   java.lang.Thread.State: RUNNABLE
	at io.netty.channel.epoll.Native.epollWait0(Native Method)
	at io.netty.channel.epoll.Native.epollWait(Native.java:114)
	at io.netty.channel.epoll.EpollEventLoop.epollWait(EpollEventLoop.java:251)
	at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:276)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at org.apache.activemq.artemis.utils.ActiveMQThreadFactory$1.run(ActiveMQThreadFactory.java:118)

   Locked ownable synchronizers:
	- None

"logback-3" #152 daemon prio=5 os_prio=0 tid=0x00007f29a4004800 nid=0xe79 waiting on condition [0x00007f290c1bc000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"logback-2" #151 daemon prio=5 os_prio=0 tid=0x00007f29a4003000 nid=0xe78 waiting on condition [0x00007f290c2bd000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1081)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"client-connection-acceptor" #147 daemon prio=5 os_prio=0 tid=0x00007f2980017000 nid=0xe73 runnable [0x00007f290ccd1000]
   java.lang.Thread.State: RUNNABLE
	at java.net.PlainSocketImpl.socketAccept(Native Method)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
	at java.net.ServerSocket.implAccept(ServerSocket.java:560)
	at java.net.ServerSocket.accept(ServerSocket.java:528)
	at fi.hibox.centre.server.job.ClientConnector$1.run(ClientConnector.java:275)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"job-worker-thread-ClientConnectorGrpc-instance-1053133" #146 daemon prio=5 os_prio=0 tid=0x00007f294447a800 nid=0xe72 in Object.wait() [0x00007f290c9ce000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c855bf50> (a fi.hibox.centre.module.job.clientconnectorgrpc.ClientConnectorGrpc)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:267)
	- locked <0x00000004c855bf50> (a fi.hibox.centre.module.job.clientconnectorgrpc.ClientConnectorGrpc)
	at fi.hibox.centre.server.job.Job.waitUntilCanceled(Job.java:286)
	- locked <0x00000004c855bf50> (a fi.hibox.centre.module.job.clientconnectorgrpc.ClientConnectorGrpc)
	at fi.hibox.centre.module.job.clientconnectorgrpc.ClientConnectorGrpc.doJob(ClientConnectorGrpc.java:163)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c855c158> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-ClientConnector-instance-3592623" #145 daemon prio=5 os_prio=0 tid=0x00007f2944479800 nid=0xe71 in Object.wait() [0x00007f290cacf000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c856db20> (a fi.hibox.centre.server.job.ClientConnector)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.ClientConnector.doJob(ClientConnector.java:295)
	- locked <0x00000004c856db20> (a fi.hibox.centre.server.job.ClientConnector)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c856dc58> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"I/O dispatcher 16" #139 prio=5 os_prio=0 tid=0x00007f29201ad000 nid=0xe6c runnable [0x00007f290cdd2000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c85552b8> (a sun.nio.ch.Util$3)
	- locked <0x00000004c85552a8> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8555260> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 15" #138 prio=5 os_prio=0 tid=0x00007f29201ab800 nid=0xe6b runnable [0x00007f290ced3000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8593930> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8593920> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c85938d8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 14" #137 prio=5 os_prio=0 tid=0x00007f29201a9800 nid=0xe6a runnable [0x00007f290cfd4000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8587b80> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8587b70> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8587b28> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 13" #136 prio=5 os_prio=0 tid=0x00007f29201a8000 nid=0xe69 runnable [0x00007f290d2d5000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c853ccb0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c853cca0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c853cc58> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 12" #135 prio=5 os_prio=0 tid=0x00007f29201a6000 nid=0xe68 runnable [0x00007f290d3d6000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8424a68> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8424a58> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8424a10> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"event-queue-last-access-worker-2" #140 daemon prio=5 os_prio=0 tid=0x00007f2924008000 nid=0xe67 in Object.wait() [0x00007f290d4d7000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c856de08> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c856de08> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at com.google.common.util.concurrent.TrustedListenableFutureTask$TrustedFutureInterruptibleTask.runInterruptibly(TrustedListenableFutureTask.java:125)
	at com.google.common.util.concurrent.InterruptibleTask.run(InterruptibleTask.java:57)
	at com.google.common.util.concurrent.TrustedListenableFutureTask.run(TrustedListenableFutureTask.java:78)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c856e170> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"I/O dispatcher 11" #134 prio=5 os_prio=0 tid=0x00007f29201a4800 nid=0xe66 runnable [0x00007f290d5d8000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c85617c0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c85617b0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8561768> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 10" #133 prio=5 os_prio=0 tid=0x00007f29201a3000 nid=0xe65 runnable [0x00007f290d6d9000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855c3a0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855c390> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855c348> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 9" #132 prio=5 os_prio=0 tid=0x00007f29201a1000 nid=0xe64 runnable [0x00007f290d7da000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8424d10> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8424d00> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8424cb8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 8" #131 prio=5 os_prio=0 tid=0x00007f292019f000 nid=0xe63 runnable [0x00007f290d8db000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855c630> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855c620> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855c5d8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 7" #130 prio=5 os_prio=0 tid=0x00007f292019d000 nid=0xe62 runnable [0x00007f290d9dc000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8424fa0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8424f90> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8424f48> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 6" #129 prio=5 os_prio=0 tid=0x00007f292019b800 nid=0xe61 runnable [0x00007f290dadd000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c853cf40> (a sun.nio.ch.Util$3)
	- locked <0x00000004c853cf30> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c853cee8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 5" #128 prio=5 os_prio=0 tid=0x00007f2920199800 nid=0xe60 runnable [0x00007f290dbde000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8561a50> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8561a40> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c85619f8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 4" #127 prio=5 os_prio=0 tid=0x00007f2920198000 nid=0xe5f runnable [0x00007f290dcdf000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8593bc0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8593bb0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8593b68> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 3" #126 prio=5 os_prio=0 tid=0x00007f2920196800 nid=0xe5e runnable [0x00007f290dde0000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8587e10> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8587e00> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8587db8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 2" #125 prio=5 os_prio=0 tid=0x00007f2920194800 nid=0xe5d runnable [0x00007f290dee1000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855c8c0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855c8b0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855c868> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"I/O dispatcher 1" #124 prio=5 os_prio=0 tid=0x00007f2920001800 nid=0xe5c runnable [0x00007f290dfe2000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8425230> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8425220> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c84251d8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractIOReactor.execute(AbstractIOReactor.java:255)
	at org.apache.http.impl.nio.reactor.BaseIOReactor.execute(BaseIOReactor.java:104)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor$Worker.run(AbstractMultiworkerIOReactor.java:591)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"event-queue-last-access-worker-1" #123 daemon prio=5 os_prio=0 tid=0x00007f2924004800 nid=0xe5b in Object.wait() [0x00007f290e0e3000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c8561c48> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:258)
	- locked <0x00000004c8561c48> (a org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl)
	at org.apache.activemq.artemis.core.client.impl.ClientConsumerImpl.receive(ClientConsumerImpl.java:397)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.receiveMessagesInBatch(EventQueueConsumerService.java:280)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$SynchronousAcknowledgeWorker.consume(EventQueueConsumerService.java:327)
	at fi.hibox.centre.protocol.service.eventqueue.EventQueueConsumerService$Worker.run(EventQueueConsumerService.java:235)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at com.google.common.util.concurrent.TrustedListenableFutureTask$TrustedFutureInterruptibleTask.runInterruptibly(TrustedListenableFutureTask.java:125)
	at com.google.common.util.concurrent.InterruptibleTask.run(InterruptibleTask.java:57)
	at com.google.common.util.concurrent.TrustedListenableFutureTask.run(TrustedListenableFutureTask.java:78)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8562000> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"pool-5-thread-1" #121 prio=5 os_prio=0 tid=0x00007f291412c000 nid=0xe5a runnable [0x00007f290e1e4000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855cb50> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855cb40> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855caf8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.http.impl.nio.reactor.AbstractMultiworkerIOReactor.execute(AbstractMultiworkerIOReactor.java:343)
	at org.apache.http.impl.nio.conn.PoolingNHttpClientConnectionManager.execute(PoolingNHttpClientConnectionManager.java:221)
	at org.apache.http.impl.nio.client.CloseableHttpAsyncClientBase$1.run(CloseableHttpAsyncClientBase.java:64)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"job-worker-thread-EventQueueLastAccess-instance-627769" #122 daemon prio=5 os_prio=0 tid=0x00007f2944477800 nid=0xe59 in Object.wait() [0x00007f290e2e5000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c85a0f48> (a fi.hibox.centre.module.job.eventqueuelastaccess.EventQueueLastAccess)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:267)
	- locked <0x00000004c85a0f48> (a fi.hibox.centre.module.job.eventqueuelastaccess.EventQueueLastAccess)
	at fi.hibox.centre.server.job.Job.waitUntilCanceled(Job.java:286)
	- locked <0x00000004c85a0f48> (a fi.hibox.centre.module.job.eventqueuelastaccess.EventQueueLastAccess)
	at fi.hibox.centre.module.job.eventqueuelastaccess.EventQueueLastAccess.doJob(EventQueueLastAccess.java:119)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c856e480> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-SlackAlertJob-instance-1010" #120 daemon prio=5 os_prio=0 tid=0x00007f2944475800 nid=0xe58 in Object.wait() [0x00007f290e3e6000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c85a0e90> (a fi.hibox.centre.module.job.slackalert.SlackAlertJob)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:267)
	- locked <0x00000004c85a0e90> (a fi.hibox.centre.module.job.slackalert.SlackAlertJob)
	at fi.hibox.centre.server.job.Job.waitUntilCanceled(Job.java:286)
	- locked <0x00000004c85a0e90> (a fi.hibox.centre.module.job.slackalert.SlackAlertJob)
	at fi.hibox.centre.module.job.slackalert.SlackAlertJob.doJob(SlackAlertJob.java:107)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8593ed0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-JobRecorder-instance-1067" #119 daemon prio=5 os_prio=0 tid=0x00007f2944468000 nid=0xe57 in Object.wait() [0x00007f290e4e7000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:264)
	- locked <0x00000004c8425428> (a fi.hibox.centre.module.job.recorder.JobRecorder)
	at fi.hibox.centre.module.job.recorder.JobRecorder.doJob(JobRecorder.java:254)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c84255c0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-MediaIndexer-instance-383680" #117 daemon prio=5 os_prio=0 tid=0x00007f2944464800 nid=0xe55 in Object.wait() [0x00007f290e6e9000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c85a0ed0> (a fi.hibox.centre.module.job.mediaindexer.MediaIndexer)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:267)
	- locked <0x00000004c85a0ed0> (a fi.hibox.centre.module.job.mediaindexer.MediaIndexer)
	at fi.hibox.centre.server.job.Job.waitUntilCanceled(Job.java:286)
	- locked <0x00000004c85a0ed0> (a fi.hibox.centre.module.job.mediaindexer.MediaIndexer)
	at fi.hibox.centre.module.job.mediaindexer.MediaIndexer.doJob(MediaIndexer.java:324)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8588148> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"nioEventLoopGroup-2-1" #116 prio=10 os_prio=0 tid=0x00007f290405f800 nid=0xe54 runnable [0x00007f290e7ea000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8555550> (a io.netty.channel.nio.SelectedSelectionKeySet)
	- locked <0x00000004c8555540> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c85554f8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at io.netty.channel.nio.SelectedSelectionKeySetSelector.select(SelectedSelectionKeySetSelector.java:62)
	at io.netty.channel.nio.NioEventLoop.select(NioEventLoop.java:786)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:434)
	at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:905)
	at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"job-worker-thread-RedisCacheEventPopulator-instance-3592622" #115 daemon prio=5 os_prio=0 tid=0x00007f2944408800 nid=0xe52 waiting on condition [0x00007f290eaeb000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c85a6f50> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ArrayBlockingQueue.take(ArrayBlockingQueue.java:403)
	at fi.hibox.centre.server.managers.caching.DistributedCachingManager.takeEvent(DistributedCachingManager.java:148)
	at fi.hibox.centre.module.job.rediscachepopulator.RedisCacheEventPopulator.doJobHelper(RedisCacheEventPopulator.java:113)
	at fi.hibox.centre.module.job.rediscachepopulator.JobImpl.doJob(JobImpl.java:40)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c85a70d8> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-ClientConnectorNg-instance-347556" #114 daemon prio=5 os_prio=0 tid=0x00007f29443fa000 nid=0xe51 in Object.wait() [0x00007f290ebec000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c855cd70> (a fi.hibox.centre.module.job.clientconnectorng.ClientConnectorNg)
	at java.lang.Object.wait(Object.java:502)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:267)
	- locked <0x00000004c855cd70> (a fi.hibox.centre.module.job.clientconnectorng.ClientConnectorNg)
	at fi.hibox.centre.server.job.Job.waitUntilCanceled(Job.java:286)
	- locked <0x00000004c855cd70> (a fi.hibox.centre.module.job.clientconnectorng.ClientConnectorNg)
	at fi.hibox.centre.module.job.clientconnectorng.ClientConnectorNg.doJob(ClientConnectorNg.java:303)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c855cee8> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"job-worker-thread-ReplayEPG-instance-3592630" #113 daemon prio=5 os_prio=0 tid=0x00007f2944037000 nid=0xe50 in Object.wait() [0x00007f290eeed000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at fi.hibox.centre.server.job.Job.deactivateAndWait(Job.java:264)
	- locked <0x00000004c8425770> (a fi.hibox.centre.module.job.generateepg.ReplayEPG)
	at fi.hibox.centre.module.job.generateepg.ReplayEPG.doJob(ReplayEPG.java:342)
	at fi.hibox.centre.server.job.Job.call(Job.java:225)
	at fi.hibox.centre.server.job.util.JobWorker$Sync.innerRun(JobWorker.java:255)
	at fi.hibox.centre.server.job.util.JobWorker.run(JobWorker.java:48)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c84258a0> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"https-jsse-nio-8443-AsyncTimeout" #111 daemon prio=5 os_prio=0 tid=0x00007f2b207d2800 nid=0xe4f sleeping[0x00007f290efee000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at org.apache.coyote.AbstractProtocol$AsyncTimeout.run(AbstractProtocol.java:1149)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-Acceptor-0" #110 daemon prio=5 os_prio=0 tid=0x00007f2b207d1000 nid=0xe4e runnable [0x00007f290f0ef000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.ServerSocketChannelImpl.accept0(Native Method)
	at sun.nio.ch.ServerSocketChannelImpl.accept(ServerSocketChannelImpl.java:422)
	at sun.nio.ch.ServerSocketChannelImpl.accept(ServerSocketChannelImpl.java:250)
	- locked <0x00000004c0fdb620> (a java.lang.Object)
	at org.apache.tomcat.util.net.NioEndpoint$Acceptor.run(NioEndpoint.java:482)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-ClientPoller-1" #109 daemon prio=5 os_prio=0 tid=0x00007f2b207cf000 nid=0xe4d runnable [0x00007f290f1f0000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855d130> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855d120> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855d0d8> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioEndpoint$Poller.run(NioEndpoint.java:825)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-ClientPoller-0" #108 daemon prio=5 os_prio=0 tid=0x00007f2b207cd800 nid=0xe4c runnable [0x00007f290f2f1000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8562248> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8562238> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c85621f0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioEndpoint$Poller.run(NioEndpoint.java:825)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-10" #107 daemon prio=5 os_prio=0 tid=0x00007f2b204f4800 nid=0xe4b waiting on condition [0x00007f290f3f2000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-9" #106 daemon prio=5 os_prio=0 tid=0x00007f2b204f3000 nid=0xe4a waiting on condition [0x00007f290f4f3000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-8" #105 daemon prio=5 os_prio=0 tid=0x00007f2b204f1000 nid=0xe49 waiting on condition [0x00007f290f5f4000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-7" #104 daemon prio=5 os_prio=0 tid=0x00007f2b204ef800 nid=0xe48 waiting on condition [0x00007f290f6f5000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-6" #103 daemon prio=5 os_prio=0 tid=0x00007f2b204ed800 nid=0xe47 waiting on condition [0x00007f290f7f6000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-5" #102 daemon prio=5 os_prio=0 tid=0x00007f2b20439800 nid=0xe46 waiting on condition [0x00007f290f8f7000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-4" #101 daemon prio=5 os_prio=0 tid=0x00007f2b20437800 nid=0xe45 waiting on condition [0x00007f290f9f8000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-3" #100 daemon prio=5 os_prio=0 tid=0x00007f2b20436000 nid=0xe44 waiting on condition [0x00007f290faf9000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-2" #99 daemon prio=5 os_prio=0 tid=0x00007f2b20434000 nid=0xe43 waiting on condition [0x00007f290fbfa000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"https-jsse-nio-8443-exec-1" #98 daemon prio=5 os_prio=0 tid=0x00007f2b20433000 nid=0xe42 waiting on condition [0x00007f290fcfb000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8425a70> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-AsyncTimeout" #97 daemon prio=5 os_prio=0 tid=0x00007f2b203ad000 nid=0xe41 sleeping[0x00007f290fdfc000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at org.apache.coyote.AbstractProtocol$AsyncTimeout.run(AbstractProtocol.java:1149)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-Acceptor-0" #96 daemon prio=5 os_prio=0 tid=0x00007f2b203ab800 nid=0xe40 runnable [0x00007f290fefd000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.ServerSocketChannelImpl.accept0(Native Method)
	at sun.nio.ch.ServerSocketChannelImpl.accept(ServerSocketChannelImpl.java:422)
	at sun.nio.ch.ServerSocketChannelImpl.accept(ServerSocketChannelImpl.java:250)
	- locked <0x00000004c0e825b0> (a java.lang.Object)
	at org.apache.tomcat.util.net.NioEndpoint$Acceptor.run(NioEndpoint.java:482)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-ClientPoller-1" #95 daemon prio=5 os_prio=0 tid=0x00007f2b203a9800 nid=0xe3f runnable [0x00007f290fffe000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c855d748> (a sun.nio.ch.Util$3)
	- locked <0x00000004c855d738> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c855d6f0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioEndpoint$Poller.run(NioEndpoint.java:825)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-ClientPoller-0" #94 daemon prio=5 os_prio=0 tid=0x00007f2b203a7800 nid=0xe3e runnable [0x00007f297c178000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c8562860> (a sun.nio.ch.Util$3)
	- locked <0x00000004c8562850> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c8562808> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioEndpoint$Poller.run(NioEndpoint.java:825)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-10" #93 daemon prio=5 os_prio=0 tid=0x00007f2b207dc000 nid=0xe3d waiting on condition [0x00007f297c279000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-9" #92 daemon prio=5 os_prio=0 tid=0x00007f2b207da800 nid=0xe3c waiting on condition [0x00007f297c37a000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-8" #91 daemon prio=5 os_prio=0 tid=0x00007f2b207d9000 nid=0xe3b waiting on condition [0x00007f297c47b000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-7" #90 daemon prio=5 os_prio=0 tid=0x00007f2b207d7000 nid=0xe3a waiting on condition [0x00007f297c57c000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-6" #89 daemon prio=5 os_prio=0 tid=0x00007f2b207d5800 nid=0xe39 waiting on condition [0x00007f297c67d000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-5" #88 daemon prio=5 os_prio=0 tid=0x00007f2b206b2800 nid=0xe38 waiting on condition [0x00007f297c77e000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-4" #87 daemon prio=5 os_prio=0 tid=0x00007f2b206b2000 nid=0xe37 waiting on condition [0x00007f297c87f000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-3" #86 daemon prio=5 os_prio=0 tid=0x00007f2b206f0000 nid=0xe36 waiting on condition [0x00007f297c980000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-2" #85 daemon prio=5 os_prio=0 tid=0x00007f2b206ef000 nid=0xe35 waiting on condition [0x00007f297ca81000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"http-nio-8080-exec-1" #84 daemon prio=5 os_prio=0 tid=0x00007f2b206b6800 nid=0xe34 waiting on condition [0x00007f297cb82000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8562a40> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:103)
	at org.apache.tomcat.util.threads.TaskQueue.take(TaskQueue.java:31)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"ContainerBackgroundProcessor[StandardEngine[Catalina]]" #83 daemon prio=5 os_prio=0 tid=0x00007f2b206b6000 nid=0xe33 sleeping[0x00007f297cc83000]
   java.lang.Thread.State: TIMED_WAITING (sleeping)
	at java.lang.Thread.sleep(Native Method)
	at org.apache.catalina.core.ContainerBase$ContainerBackgroundProcessor.run(ContainerBase.java:1359)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"job-runner" #82 daemon prio=5 os_prio=0 tid=0x00007f29ecf13800 nid=0xe31 waiting on condition [0x00007f297cd84000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8426068> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.DelayQueue.take(DelayQueue.java:223)
	at fi.hibox.centre.server.job.util.JobRunner.run(JobRunner.java:134)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"centre-common-scheduled-3" #81 daemon prio=5 os_prio=0 tid=0x00007f29ecf12000 nid=0xe30 waiting on condition [0x00007f29e77bd000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8563050> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1129)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"media-change-manager-scheduled" #79 daemon prio=5 os_prio=0 tid=0x00007f29ecc1d000 nid=0xe2d waiting on condition [0x00007f297d1f4000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c85a7488> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-scheduled-2" #78 daemon prio=5 os_prio=0 tid=0x00007f29ecc18000 nid=0xe2c waiting on condition [0x00007f297d2f5000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8563050> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1134)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"recording-space-task" #74 daemon prio=5 os_prio=0 tid=0x00007f29ecb5f000 nid=0xd65 runnable [0x00007f297e0f7000]
   java.lang.Thread.State: RUNNABLE
	at java.net.SocketInputStream.socketRead0(Native Method)
	at java.net.SocketInputStream.socketRead(SocketInputStream.java:116)
	at java.net.SocketInputStream.read(SocketInputStream.java:171)
	at java.net.SocketInputStream.read(SocketInputStream.java:141)
	at java.io.FilterInputStream.read(FilterInputStream.java:133)
	at org.mariadb.jdbc.internal.io.input.ReadAheadBufferedStream.fillBuffer(ReadAheadBufferedStream.java:130)
	at org.mariadb.jdbc.internal.io.input.ReadAheadBufferedStream.read(ReadAheadBufferedStream.java:103)
	- locked <0x00000004cd6c7820> (a org.mariadb.jdbc.internal.io.input.ReadAheadBufferedStream)
	at org.mariadb.jdbc.internal.io.input.StandardPacketInputStream.getPacketArray(StandardPacketInputStream.java:244)
	at org.mariadb.jdbc.internal.io.input.StandardPacketInputStream.getPacket(StandardPacketInputStream.java:215)
	at org.mariadb.jdbc.internal.protocol.AbstractQueryProtocol.readPacket(AbstractQueryProtocol.java:1435)
	at org.mariadb.jdbc.internal.protocol.AbstractQueryProtocol.getResult(AbstractQueryProtocol.java:1415)
	at org.mariadb.jdbc.internal.protocol.AbstractQueryProtocol.executeQuery(AbstractQueryProtocol.java:227)
	at org.mariadb.jdbc.MariaDbStatement.executeInternal(MariaDbStatement.java:321)
	at org.mariadb.jdbc.MariaDbStatement.executeQuery(MariaDbStatement.java:501)
	at com.zaxxer.hikari.pool.ProxyStatement.executeQuery(ProxyStatement.java:111)
	at com.zaxxer.hikari.pool.HikariProxyStatement.executeQuery(HikariProxyStatement.java)
	at fi.hibox.centre.server.database.DatabaseMediator.executeQuery(DatabaseMediator.java:131)
	at fi.hibox.centre.server.database.CentreMediator.executeQuery(CentreMediator.java:108)
	at fi.hibox.centre.server.database.RecordingMediator.getMaxPriority(RecordingMediator.java:726)
	at fi.hibox.centre.server.database.CentreDatabase.getMaxPriority(CentreDatabase.java:4912)
	at fi.hibox.centre.server.managers.recording.RecordingManager.freeSpace(RecordingManager.java:2031)
	at fi.hibox.centre.server.managers.recording.RecordingSpaceTask.run(RecordingSpaceTask.java:73)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- <0x00000004cd6c6ea0> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
	- <0x00000004eac01b90> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)

"centre-common-5" #73 daemon prio=5 os_prio=0 tid=0x00007f29ecb5d000 nid=0xd64 waiting on condition [0x00007f297e1f8000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-4" #72 daemon prio=5 os_prio=0 tid=0x00007f29ecb3c000 nid=0xd63 waiting on condition [0x00007f297e2f9000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-3" #71 daemon prio=5 os_prio=0 tid=0x00007f29ecb36000 nid=0xd62 waiting on condition [0x00007f297e3fa000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-2" #70 daemon prio=5 os_prio=0 tid=0x00007f29ecb35000 nid=0xd57 waiting on condition [0x00007f297eafb000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"centre-common-1" #69 daemon prio=5 os_prio=0 tid=0x00007f29ecb3a800 nid=0xd56 waiting on condition [0x00007f297ebfc000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c84224b0> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingQueue.poll(LinkedBlockingQueue.java:467)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"channel-notification-worker" #68 daemon prio=5 os_prio=0 tid=0x00007f29eca94800 nid=0xd55 waiting on condition [0x00007f297eefd000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c85632b8> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.DelayQueue.take(DelayQueue.java:211)
	at fi.hibox.centre.server.managers.ChannelNotificationManager$NotificationWorker.run(ChannelNotificationManager.java:335)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at com.google.common.util.concurrent.TrustedListenableFutureTask$TrustedFutureInterruptibleTask.runInterruptibly(TrustedListenableFutureTask.java:125)
	at com.google.common.util.concurrent.InterruptibleTask.run(InterruptibleTask.java:57)
	at com.google.common.util.concurrent.TrustedListenableFutureTask.run(TrustedListenableFutureTask.java:78)
	at fi.hibox.lib.metrics.micrometer.jvm.TimedRunnable.run(TimedRunnable.java:32)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- <0x00000004c8563408> (a java.util.concurrent.ThreadPoolExecutor$Worker)

"centre-common-scheduled-1" #65 daemon prio=5 os_prio=0 tid=0x00007f29ec97e000 nid=0xd43 waiting on condition [0x00007f29e45c1000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8563050> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:1129)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.poll(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1073)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
	at fi.hibox.lib.concurrent.MDCThreadFactory$MDCThread.run(MDCThreadFactory.java:103)

   Locked ownable synchronizers:
	- None

"CentreDatabase housekeeper" #63 daemon prio=5 os_prio=0 tid=0x00007f29ec714000 nid=0xcdf waiting on condition [0x00007f29e41bf000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8426600> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1093)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-1-thread-2" #61 daemon prio=5 os_prio=0 tid=0x00007f2a4c005800 nid=0xcdc waiting on condition [0x00007f29e44c0000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0ae3490> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"Thread-24" #57 daemon prio=5 os_prio=0 tid=0x00007f2994001800 nid=0xcc3 runnable [0x00007f29e48c2000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c856efe0> (a sun.nio.ch.Util$3)
	- locked <0x00000004c856efd0> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c856ef88> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at sun.net.httpserver.ServerImpl$Dispatcher.run(ServerImpl.java:352)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"server-timer" #55 daemon prio=5 os_prio=0 tid=0x00007f29ec5ac800 nid=0xcc1 in Object.wait() [0x00007f29e4ac4000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at java.util.TimerThread.mainLoop(Timer.java:552)
	- locked <0x00000004c85a0f88> (a java.util.TaskQueue)
	at java.util.TimerThread.run(Timer.java:505)

   Locked ownable synchronizers:
	- None

"logback-1" #37 daemon prio=5 os_prio=0 tid=0x00007f29f0e30800 nid=0xc71 waiting on condition [0x00007f29e66d6000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c8421128> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:1088)
	at java.util.concurrent.ScheduledThreadPoolExecutor$DelayedWorkQueue.take(ScheduledThreadPoolExecutor.java:809)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"pool-1-thread-1" #36 daemon prio=5 os_prio=0 tid=0x00007f2a4c001800 nid=0xb3a waiting on condition [0x00007f29e71d7000]
   java.lang.Thread.State: WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0ae3490> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.await(AbstractQueuedSynchronizer.java:2039)
	at java.util.concurrent.LinkedBlockingQueue.take(LinkedBlockingQueue.java:442)
	at java.util.concurrent.ThreadPoolExecutor.getTask(ThreadPoolExecutor.java:1074)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1134)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"NioBlockingSelector.BlockPoller-2" #30 daemon prio=5 os_prio=0 tid=0x00007f2b2092c800 nid=0xacb runnable [0x00007f2a6c6bc000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c0c4e838> (a sun.nio.ch.Util$3)
	- locked <0x00000004c0c4e848> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c0c4e7f0> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioBlockingSelector$BlockPoller.run(NioBlockingSelector.java:298)

   Locked ownable synchronizers:
	- None

"NioBlockingSelector.BlockPoller-1" #29 daemon prio=5 os_prio=0 tid=0x00007f2b2061b000 nid=0xab3 runnable [0x00007f2a6c9bd000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c0c4ea70> (a sun.nio.ch.Util$3)
	- locked <0x00000004c0c4ea80> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c0c4ea28> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at org.apache.tomcat.util.net.NioBlockingSelector$BlockPoller.run(NioBlockingSelector.java:298)

   Locked ownable synchronizers:
	- None

"GC Daemon" #28 daemon prio=2 os_prio=0 tid=0x00007f2b20893800 nid=0xaae in Object.wait() [0x00007f2a6cf24000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	- waiting on <0x00000004c0c4ec08> (a sun.misc.GC$LatencyLock)
	at sun.misc.GC$Daemon.run(GC.java:117)
	- locked <0x00000004c0c4ec08> (a sun.misc.GC$LatencyLock)

   Locked ownable synchronizers:
	- None

"RMI TCP Accept-0" #27 daemon prio=5 os_prio=0 tid=0x00007f2b20575800 nid=0xa78 runnable [0x00007f2a6d526000]
   java.lang.Thread.State: RUNNABLE
	at java.net.PlainSocketImpl.socketAccept(Native Method)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
	at java.net.ServerSocket.implAccept(ServerSocket.java:560)
	at java.net.ServerSocket.accept(ServerSocket.java:528)
	at sun.management.jmxremote.LocalRMIServerSocketFactory$1.accept(LocalRMIServerSocketFactory.java:52)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.executeAcceptLoop(TCPTransport.java:405)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.run(TCPTransport.java:377)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"RMI TCP Accept-30648" #26 daemon prio=5 os_prio=0 tid=0x00007f2b20571000 nid=0xa77 runnable [0x00007f2a6d627000]
   java.lang.Thread.State: RUNNABLE
	at java.net.PlainSocketImpl.socketAccept(Native Method)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
	at java.net.ServerSocket.implAccept(ServerSocket.java:560)
	at java.net.ServerSocket.accept(ServerSocket.java:528)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.executeAcceptLoop(TCPTransport.java:405)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.run(TCPTransport.java:377)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"RMI TCP Accept-0" #25 daemon prio=5 os_prio=0 tid=0x00007f2b20562000 nid=0xa76 runnable [0x00007f2a6d928000]
   java.lang.Thread.State: RUNNABLE
	at java.net.PlainSocketImpl.socketAccept(Native Method)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
	at java.net.ServerSocket.implAccept(ServerSocket.java:560)
	at java.net.ServerSocket.accept(ServerSocket.java:528)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.executeAcceptLoop(TCPTransport.java:405)
	at sun.rmi.transport.tcp.TCPTransport$AcceptLoop.run(TCPTransport.java:377)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"Service Thread" #24 daemon prio=9 os_prio=0 tid=0x00007f2b204ac000 nid=0xa75 runnable [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C1 CompilerThread11" #23 daemon prio=9 os_prio=0 tid=0x00007f2b204a7000 nid=0xa74 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C1 CompilerThread10" #22 daemon prio=9 os_prio=0 tid=0x00007f2b20432000 nid=0xa73 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C1 CompilerThread9" #21 daemon prio=9 os_prio=0 tid=0x00007f2b20430000 nid=0xa72 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C1 CompilerThread8" #20 daemon prio=9 os_prio=0 tid=0x00007f2b2042e800 nid=0xa71 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread7" #19 daemon prio=9 os_prio=0 tid=0x00007f2b2042c000 nid=0xa70 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread6" #18 daemon prio=9 os_prio=0 tid=0x00007f2b20473000 nid=0xa6f waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread5" #17 daemon prio=9 os_prio=0 tid=0x00007f2b20471000 nid=0xa6e waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread4" #16 daemon prio=9 os_prio=0 tid=0x00007f2b2046e800 nid=0xa6d waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread3" #15 daemon prio=9 os_prio=0 tid=0x00007f2b2046c800 nid=0xa6c waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread2" #14 daemon prio=9 os_prio=0 tid=0x00007f2b2046a800 nid=0xa6b waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread1" #13 daemon prio=9 os_prio=0 tid=0x00007f2b20483000 nid=0xa6a waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"C2 CompilerThread0" #12 daemon prio=9 os_prio=0 tid=0x00007f2b20482800 nid=0xa69 waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Thread-4" #11 daemon prio=5 os_prio=0 tid=0x00007f2a48001000 nid=0xa68 runnable [0x00007f2a6e635000]
   java.lang.Thread.State: RUNNABLE
	at sun.nio.ch.EPollArrayWrapper.epollWait(Native Method)
	at sun.nio.ch.EPollArrayWrapper.poll(EPollArrayWrapper.java:269)
	at sun.nio.ch.EPollSelectorImpl.doSelect(EPollSelectorImpl.java:93)
	at sun.nio.ch.SelectorImpl.lockAndDoSelect(SelectorImpl.java:86)
	- locked <0x00000004c0c4fe50> (a sun.nio.ch.Util$3)
	- locked <0x00000004c0c69e30> (a java.util.Collections$UnmodifiableSet)
	- locked <0x00000004c0c69c78> (a sun.nio.ch.EPollSelectorImpl)
	at sun.nio.ch.SelectorImpl.select(SelectorImpl.java:97)
	at sun.net.httpserver.ServerImpl$Dispatcher.run(ServerImpl.java:352)
	at java.lang.Thread.run(Thread.java:748)

   Locked ownable synchronizers:
	- None

"server-timer" #9 daemon prio=5 os_prio=0 tid=0x00007f2b2040e800 nid=0xa66 in Object.wait() [0x00007f2a6e837000]
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at java.util.TimerThread.mainLoop(Timer.java:552)
	- locked <0x00000004c0a06df8> (a java.util.TaskQueue)
	at java.util.TimerThread.run(Timer.java:505)

   Locked ownable synchronizers:
	- None

"AsyncFileHandlerWriter-140435067" #8 daemon prio=5 os_prio=0 tid=0x00007f2b203af000 nid=0xa57 runnable [0x00007f2a6eb42000]
   java.lang.Thread.State: TIMED_WAITING (parking)
	at sun.misc.Unsafe.park(Native Method)
	- parking to wait for  <0x00000004c0b2c928> (a java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject)
	at java.util.concurrent.locks.LockSupport.parkNanos(LockSupport.java:215)
	at java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject.awaitNanos(AbstractQueuedSynchronizer.java:2078)
	at java.util.concurrent.LinkedBlockingDeque.pollFirst(LinkedBlockingDeque.java:522)
	at java.util.concurrent.LinkedBlockingDeque.poll(LinkedBlockingDeque.java:684)
	at org.apache.juli.AsyncFileHandler$LoggerThread.run(AsyncFileHandler.java:160)

   Locked ownable synchronizers:
	- None

"Signal Dispatcher" #5 daemon prio=9 os_prio=0 tid=0x00007f2b202f8800 nid=0xa3f runnable [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Surrogate Locker Thread (Concurrent GC)" #4 daemon prio=9 os_prio=0 tid=0x00007f2b202f7000 nid=0xa3e waiting on condition [0x0000000000000000]
   java.lang.Thread.State: RUNNABLE

   Locked ownable synchronizers:
	- None

"Finalizer" #3 daemon prio=8 os_prio=0 tid=0x00007f2b202c3800 nid=0xa3c in Object.wait() [0x00007f2a7c31f000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:144)
	- locked <0x00000004c0a06de8> (a java.lang.ref.ReferenceQueue$Lock)
	at java.lang.ref.ReferenceQueue.remove(ReferenceQueue.java:165)
	at java.lang.ref.Finalizer$FinalizerThread.run(Finalizer.java:216)

   Locked ownable synchronizers:
	- None

"Reference Handler" #2 daemon prio=10 os_prio=0 tid=0x00007f2b202c1000 nid=0xa3b in Object.wait() [0x00007f2a7c420000]
   java.lang.Thread.State: WAITING (on object monitor)
	at java.lang.Object.wait(Native Method)
	at java.lang.Object.wait(Object.java:502)
	at java.lang.ref.Reference.tryHandlePending(Reference.java:191)
	- locked <0x00000004c0a06dd8> (a java.lang.ref.Reference$Lock)
	at java.lang.ref.Reference$ReferenceHandler.run(Reference.java:153)

   Locked ownable synchronizers:
	- None

"main" #1 prio=5 os_prio=0 tid=0x00007f2b2000e000 nid=0xa13 runnable [0x00007f2b28bdc000]
   java.lang.Thread.State: RUNNABLE
	at java.net.PlainSocketImpl.socketAccept(Native Method)
	at java.net.AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:409)
	at java.net.ServerSocket.implAccept(ServerSocket.java:560)
	at java.net.ServerSocket.accept(ServerSocket.java:528)
	at org.apache.catalina.core.StandardServer.await(StandardServer.java:466)
	at org.apache.catalina.startup.Catalina.await(Catalina.java:776)
	at org.apache.catalina.startup.Catalina.start(Catalina.java:722)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.apache.catalina.startup.Bootstrap.start(Bootstrap.java:353)
	at org.apache.catalina.startup.Bootstrap.main(Bootstrap.java:497)

   Locked ownable synchronizers:
	- None

"VM Thread" os_prio=0 tid=0x00007f2b202b7800 nid=0xa3a runnable

"Gang worker#0 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20023000 nid=0xa15 runnable

"Gang worker#1 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20024800 nid=0xa16 runnable

"Gang worker#2 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20026800 nid=0xa17 runnable

"Gang worker#3 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20028000 nid=0xa18 runnable

"Gang worker#4 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b2002a000 nid=0xa19 runnable

"Gang worker#5 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b2002b800 nid=0xa1a runnable

"Gang worker#6 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b2002d800 nid=0xa1b runnable

"Gang worker#7 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b2002f000 nid=0xa1c runnable

"Gang worker#8 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20031000 nid=0xa1d runnable

"Gang worker#9 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20032800 nid=0xa1e runnable

"Gang worker#10 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20034800 nid=0xa1f runnable

"Gang worker#11 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20036000 nid=0xa20 runnable

"Gang worker#12 (Parallel GC Threads)" os_prio=0 tid=0x00007f2b20037800 nid=0xa21 runnable

"G1 Main Concurrent Mark GC Thread" os_prio=0 tid=0x00007f2b2006a800 nid=0xa31 runnable

"Gang worker#0 (G1 Parallel Marking Threads)" os_prio=0 tid=0x00007f2b2006c000 nid=0xa32 runnable

"Gang worker#1 (G1 Parallel Marking Threads)" os_prio=0 tid=0x00007f2b2006e000 nid=0xa33 runnable

"Gang worker#2 (G1 Parallel Marking Threads)" os_prio=0 tid=0x00007f2b2006f800 nid=0xa34 runnable

"G1 Concurrent Refinement Thread#0" os_prio=0 tid=0x00007f2b20051800 nid=0xa2f runnable

"G1 Concurrent Refinement Thread#1" os_prio=0 tid=0x00007f2b20050000 nid=0xa2e runnable

"G1 Concurrent Refinement Thread#2" os_prio=0 tid=0x00007f2b2004e000 nid=0xa2d runnable

"G1 Concurrent Refinement Thread#3" os_prio=0 tid=0x00007f2b2004c800 nid=0xa2c runnable

"G1 Concurrent Refinement Thread#4" os_prio=0 tid=0x00007f2b2004a800 nid=0xa2b runnable

"G1 Concurrent Refinement Thread#5" os_prio=0 tid=0x00007f2b20049000 nid=0xa2a runnable

"G1 Concurrent Refinement Thread#6" os_prio=0 tid=0x00007f2b20047000 nid=0xa29 runnable

"G1 Concurrent Refinement Thread#7" os_prio=0 tid=0x00007f2b20045000 nid=0xa28 runnable

"G1 Concurrent Refinement Thread#8" os_prio=0 tid=0x00007f2b20043800 nid=0xa27 runnable

"G1 Concurrent Refinement Thread#9" os_prio=0 tid=0x00007f2b20041800 nid=0xa26 runnable

"G1 Concurrent Refinement Thread#10" os_prio=0 tid=0x00007f2b20040000 nid=0xa25 runnable

"G1 Concurrent Refinement Thread#11" os_prio=0 tid=0x00007f2b2003e000 nid=0xa24 runnable

"G1 Concurrent Refinement Thread#12" os_prio=0 tid=0x00007f2b2003c800 nid=0xa23 runnable

"G1 Concurrent Refinement Thread#13" os_prio=0 tid=0x00007f2b2003a800 nid=0xa22 runnable

"VM Periodic Task Thread" os_prio=0 tid=0x00007f2b20578000 nid=0xa79 waiting on condition

JNI global references: 3657

```

### Looking for non-daemon threads

"I/O dispatcher 16" #245 prio=5 os_prio=0 tid=0x00007f29941ab000 nid=0xf44 runnable [0x00007f28c67b1000]
"I/O dispatcher 15" #244 prio=5 os_prio=0 tid=0x00007f29941a9800 nid=0xf43 runnable [0x00007f28c68b2000]
"I/O dispatcher 14" #243 prio=5 os_prio=0 tid=0x00007f29941a7800 nid=0xf42 runnable [0x00007f28c69b3000]
"I/O dispatcher 13" #242 prio=5 os_prio=0 tid=0x00007f29941a6000 nid=0xf41 runnable [0x00007f28c6ab4000]
"I/O dispatcher 12" #241 prio=5 os_prio=0 tid=0x00007f29941a4800 nid=0xf40 runnable [0x00007f28c6bb5000]
"I/O dispatcher 11" #240 prio=5 os_prio=0 tid=0x00007f29941a2800 nid=0xf3f runnable [0x00007f28c6cb6000]
...
"pool-5-thread-1" #121 prio=5 os_prio=0 tid=0x00007f291412c000 nid=0xe5a runnable [0x00007f290e1e4000]
   java.lang.Thread.State: RUNNABLE
"nioEventLoopGroup-2-1" #116 prio=10 os_prio=0 tid=0x00007f290405f800 nid=0xe54 runnable [0x00007f290e7ea000]

"main" #1 prio=5 os_prio=0 tid=0x00007f2b2000e000 nid=0xa13 runnable [0x00007f2b28bdc000]
   java.lang.Thread.State: RUNNABLE

### Looking for locked synchronizers

```shell
$ grep -A1 "Locked ownable synchronizers" threads.txt
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004ee4004b0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004ed900cb8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004ed900f50> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c5100898> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c8542708> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c8593140> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c856d2f0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c853c7a0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c8423820> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c8599a10> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c856d970> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c859a0a8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c855c158> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c856dc58> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c856e170> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c8562000> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c856e480> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c8593ed0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c84255c0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c8588148> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c85a70d8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c855cee8> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- <0x00000004c84258a0> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004cd6c6ea0> (a java.util.concurrent.locks.ReentrantLock$NonfairSync)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- <0x00000004c8563408> (a java.util.concurrent.ThreadPoolExecutor$Worker)
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
--
   Locked ownable synchronizers:
	- None
```

### Looking at the thread state

```
$ grep "java.lang.Thread.State" threads.txt
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (sleeping)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: TIMED_WAITING (on object monitor)
   java.lang.Thread.State: TIMED_WAITING (parking)
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: RUNNABLE
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: WAITING (on object monitor)
   java.lang.Thread.State: RUNNABLE
```

### Trying to kill it manually

```
$ sudo kill 2577
$ ps -fe | grep 2577
tomcat8    2577      1 51 08:18 ?        00:08:01 /usr/lib/jvm/adoptopenjdk-8-hotspot-amd64/bin/java -D<various-properties...> -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -classpath /usr/share/tomcat8/bin/bootstrap.jar:/usr/share/tomcat8/bin/tomcat-juli.jar -Dcatalina.base=/var/lib/tomcat8 -Dcatalina.home=/usr/share/tomcat8 -Djava.io.tmpdir=/tmp/tomcat8-tomcat8-tmp org.apache.catalina.startup.Bootstrap start
plundberg 11774   3607  0 08:46 pts/0    00:00:00 grep --color=auto 2577
$ sudo kill -9 2577
kill: (2577): No such process
```

### Conclusion

This was a false alarm; there _wasn't_ really any thread blocking the Tomcat shutdown in this case. It was more a matter of `systemd` not being able to notify the process correctly about the shutdown, or the Tomcat process not listening for the shutdown command properly. A plain `SIGTERM` (`kill <pid>`) worked fine in this case; `SIGKILL` (`kill -9 <pid>`) was not necessary.
