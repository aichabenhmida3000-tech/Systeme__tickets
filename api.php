<?php
include 'db.php';
$action=$_GET['action'];
$data=json_decode(file_get_contents("php://input"),true);
if($action=='login'){
    $sql="SELECT * FROM users WHERE username='{$data['username']}' AND password='{$data['password']}'";
    $res=mysqli_query($cnx,$sql);
    if(mysqli_num_rows($res)>0){
        $user=mysqli_fetch_assoc($res);unset($user['password']);
        echo json_encode(["success"=>true,"user"=>$user]);
    }else{echo json_encode(["success"=>false]);}}
elseif($action=='signup'){
    $sql="INSERT INTO users (username,email,password,role) VALUES ('{$data['username']}','{$data['email']}','{$data['password']}','{$data['role']}')";
    echo json_encode(["success"=>mysqli_query($cnx,$sql)]);}
elseif($action=='tickets'){
    $user=$data['user'];
    if($user['role']=='admin')$sql="SELECT t.*,u.username as creator,s.username as support FROM tickets t LEFT JOIN users u ON t.created_by=u.id LEFT JOIN users s ON t.assigned_to=s.id";
    elseif($user['role']=='support')$sql="SELECT t.*,u.username as creator FROM tickets t LEFT JOIN users u ON t.created_by=u.id WHERE t.assigned_to={$user['id']}";
    else $sql="SELECT * FROM tickets WHERE created_by={$user['id']}";
    $res=mysqli_query($cnx,$sql);$tickets=[];while($row=mysqli_fetch_assoc($res))$tickets[]=$row;
    echo json_encode($tickets);}
elseif($action=='create-ticket'){
    $sql="INSERT INTO tickets (title,description,category,priority,created_by) VALUES ('{$data['title']}','{$data['description']}','{$data['category']}','{$data['priority']}',{$data['user_id']})";
    mysqli_query($cnx,$sql);echo json_encode(["success"=>true]);}
elseif($action=='assign'){
    mysqli_query($cnx,"UPDATE tickets SET assigned_to={$data['support_id']},status='en-cours' WHERE id={$data['ticket_id']}");
    echo json_encode(["success"=>true]);}
elseif($action=='update-status'){
    mysqli_query($cnx,"UPDATE tickets SET status='{$data['status']}' WHERE id={$data['ticket_id']}");
    echo json_encode(["success"=>true]);}
elseif($action=='supports'){
    $res=mysqli_query($cnx,"SELECT id,username FROM users WHERE role='support'");
    $supp=[];while($row=mysqli_fetch_assoc($res))$supp[]=$row;
    echo json_encode($supp);}
elseif($action=='stats'){
    $stats=[];
    $stats['total']=mysqli_fetch_assoc(mysqli_query($cnx,"SELECT COUNT(*) as c FROM tickets"))['c'];
    $stats['en_attente']=mysqli_fetch_assoc(mysqli_query($cnx,"SELECT COUNT(*) as c FROM tickets WHERE status='en-attente'"))['c'];
    $stats['en_cours']=mysqli_fetch_assoc(mysqli_query($cnx,"SELECT COUNT(*) as c FROM tickets WHERE status='en-cours'"))['c'];
    $stats['resolus']=mysqli_fetch_assoc(mysqli_query($cnx,"SELECT COUNT(*) as c FROM tickets WHERE status='resolu'"))['c'];
    $stats['urgents']=mysqli_fetch_assoc(mysqli_query($cnx,"SELECT COUNT(*) as c FROM tickets WHERE priority='urgente'"))['c'];
    $res=mysqli_query($cnx,"SELECT priority,COUNT(*) as c FROM tickets GROUP BY priority");
    while($row=mysqli_fetch_assoc($res))$stats[$row['priority']]=$row['c'];
    $res=mysqli_query($cnx,"SELECT category,COUNT(*) as c FROM tickets GROUP BY category");
    $stats['categories']=[];
    while($row=mysqli_fetch_assoc($res))$stats['categories'][$row['category']]=$row['c'];
    echo json_encode($stats);}?>